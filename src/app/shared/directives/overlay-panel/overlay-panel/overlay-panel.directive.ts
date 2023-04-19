/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { _getEventTarget } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import { Directive, ElementRef, EventEmitter, inject, Inject, InjectionToken, Injector, Input, OnChanges, OnDestroy, Optional, Output, SimpleChanges, TemplateRef, ViewContainerRef, } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, takeWhile } from 'rxjs/operators';
import {
  Overlay, OverlayConfig, OverlayRef, ConnectedOverlayPositionChange, ConnectedPosition, FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin, RepositionScrollStrategy, ScrollStrategy, STANDARD_DROPDOWN_BELOW_POSITIONS
} from '@angular/cdk/overlay';
import { animate, AnimationBuilder, AnimationFactory, style } from '@angular/animations';

/** Injection token that determines the scroll handling while the connected overlay is open. */
export const APP_CONNECTED_OVERLAY_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
  'app-connected-overlay-scroll-strategy',
);

/** Injection token for overlay trigger. */
export const OVERLAY_TRIGGER = new InjectionToken<AppOverlayOrigin>('app-overlay-trigger');

/**
 * Directive applied to an element to make it usable as an origin for an Overlay using a
 * ConnectedPositionStrategy.
 */
@Directive({
  selector: '[appOverlayOrigin]',
  exportAs: 'appOverlayOrigin',
  host: {
    '(click)': 'toggle()'
  }
})
export class AppOverlayOrigin implements OnChanges, OnDestroy {
  private injector = inject(Injector);
  private _overlay = inject(Overlay);
  private _hasBackdrop = false;
  private _lockPosition = true;
  private _growAfterOpen = false;
  private _flexibleDimensions = false;
  private _push = false;
  private _backdropSubscription = Subscription.EMPTY;
  private _positionSubscription = Subscription.EMPTY;
  private _offsetX!: number;
  private _offsetY!: number;
  private _position!: FlexibleConnectedPositionStrategy;
  private _scrollStrategyFactory: () => ScrollStrategy;
  private showAnimation: AnimationFactory;

  /** A reference to the overlay */
  private _overlayRef: OverlayRef | null = null;

  /** The content of the overlay panel opened by this trigger. */
  private _overlayPortal!: TemplatePortal;

  /** The injector to use for the child overlay opened by this trigger. */
  private _childOverlayInjector?: Injector;

  /** Emits when this trigger is destroyed. */
  private readonly destroyed: Subject<void> = new Subject();

  /** Template reference variable to the overlay this trigger opens */
  @Input('appOverlayOrigin') overlayTemplateRef: TemplateRef<unknown> | null = null;

  /** Origin for the connected overlay. */
  origin!: AppOverlayOrigin | FlexibleConnectedPositionStrategyOrigin;

  /**
   * This input overrides the positions input if specified. It lets users pass
   * in arbitrary positioning strategies.
   */
  @Input('overlayPositionStrategy') positionStrategy!: FlexibleConnectedPositionStrategy;

  /** The offset in pixels for the overlay connection point on the x-axis */
  @Input('overlayOffsetX')
  get offsetX(): number {
    return this._offsetX;
  }
  set offsetX(offsetX: number) {
    this._offsetX = offsetX;

    if (this._position) {
      this._updatePositionStrategy(this._position);
    }
  }

  /** The offset in pixels for the overlay connection point on the y-axis */
  @Input('overlayOffsetY')
  get offsetY() {
    return this._offsetY;
  }
  set offsetY(offsetY: number) {
    this._offsetY = offsetY;

    if (this._position) {
      this._updatePositionStrategy(this._position);
    }
  }

  /** The width of the overlay panel. */
  @Input('overlayWidth') width!: number | string;

  /** The height of the overlay panel. */
  @Input('overlayHeight') height!: number | string;

  /** The min width of the overlay panel. */
  @Input('overlayMinWidth') minWidth!: number | string;

  /** The min height of the overlay panel. */
  @Input('overlayMinHeight') minHeight!: number | string;

  /** The custom class to be set on the backdrop element. */
  @Input('overlayBackdropClass') backdropClass!: string | string[];

  /** The custom class to add to the overlay pane element. */
  @Input('overlayPanelClass') panelClass!: string | string[];

  /** Margin between the overlay and the viewport edges. */
  @Input('overlayViewportMargin') viewportMargin: number = 0;

  /** Strategy to be used when handling scroll events while the overlay is open. */
  @Input('overlayScrollStrategy') scrollStrategy: ScrollStrategy;

  /** Whether the overlay is open. */
  @Input('overlayOpen') open: boolean = false;

  /** Whether the overlay can be closed by user interaction. */
  @Input('overlayDisableClose') disableClose: boolean = false;

  /** CSS selector which to set the transform origin. */
  @Input('overlayTransformOriginOn') transformOriginSelector!: string;

  /** Whether or not the overlay should attach a backdrop. */
  @Input('overlayHasBackdrop')
  get hasBackdrop(): boolean {
    return this._hasBackdrop;
  }
  set hasBackdrop(value: BooleanInput) {
    this._hasBackdrop = coerceBooleanProperty(value);
  }

  /** Whether or not the overlay should be locked when scrolling. */
  @Input('overlayLockPosition')
  get lockPosition(): boolean {
    return this._lockPosition;
  }
  set lockPosition(value: BooleanInput) {
    this._lockPosition = coerceBooleanProperty(value);
  }

  /** Whether the overlay's width and height can be constrained to fit within the viewport. */
  @Input('overlayFlexibleDimensions')
  get flexibleDimensions(): boolean {
    return this._flexibleDimensions;
  }
  set flexibleDimensions(value: BooleanInput) {
    this._flexibleDimensions = coerceBooleanProperty(value);
  }

  /** Whether the overlay can grow after the initial open when flexible positioning is turned on. */
  @Input('overlayGrowAfterOpen')
  get growAfterOpen(): boolean {
    return this._growAfterOpen;
  }
  set growAfterOpen(value: BooleanInput) {
    this._growAfterOpen = coerceBooleanProperty(value);
  }

  /** Whether the overlay can be pushed on-screen if none of the provided positions fit. */
  @Input('overlayPush')
  get push(): boolean {
    return this._push;
  }
  set push(value: BooleanInput) {
    this._push = coerceBooleanProperty(value);
  }

  /** Event emitted when the backdrop is clicked. */
  @Output() readonly backdropClick = new EventEmitter<MouseEvent>();

  /** Event emitted when the position has changed. */
  @Output() readonly positionChange = new EventEmitter<ConnectedOverlayPositionChange>();

  /** Event emitted when the overlay has been attached. */
  @Output() readonly attach = new EventEmitter<void>();

  /** Event emitted when the overlay has been detached. */
  @Output() readonly detach = new EventEmitter<void>();

  /** Emits when there are keyboard events that are targeted at the overlay. */
  @Output() readonly overlayKeydown = new EventEmitter<KeyboardEvent>();

  /** Emits when there are mouse outside click events that are targeted at the overlay. */
  @Output() readonly overlayOutsideClick = new EventEmitter<MouseEvent>();

  /** Emits when the overlay is requested to open */
  @Output() readonly opened: EventEmitter<void> = new EventEmitter();

  /** Emits when the overlay is requested to close */
  @Output() readonly closed: EventEmitter<void> = new EventEmitter();

  constructor(
    /** Reference to the element on which the directive is applied. */
    public elementRef: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private animationBuilder: AnimationBuilder,
    @Inject(APP_CONNECTED_OVERLAY_SCROLL_STRATEGY) scrollStrategyFactory: any,
    @Optional() private _dir: Directionality
  ) {
    this._scrollStrategyFactory = scrollStrategyFactory;
    this.scrollStrategy = this._scrollStrategyFactory();
    this.showAnimation = this.animationBuilder.build([
      style({ opacity: 0 }),
      animate('100ms ease-in', style({ opacity: 1 })),
    ]);
  }

  /** Whether the overlay is open. */
  isOpen() {
    return !!this._overlayRef?.hasAttached();
  }

  /** Toggle the attached overlay. */
  toggle() {
    if (this.isOpen()) {
      this._detachOverlay();
    } else {
      this._attachOverlay();
    }
  }

  private getOverlayContentPortal() {
    const hasOverlayContentChanged = this.overlayTemplateRef !== this._overlayPortal?.templateRef;
    if (this.overlayTemplateRef && (!this._overlayPortal || hasOverlayContentChanged)) {
      this._overlayPortal = new TemplatePortal(
        this.overlayTemplateRef,
        this.viewContainerRef,
        undefined,
        this._getChildOverlayInjector()
      );
    }

    return this._overlayPortal;
  }

  /** Gets the injector to use when creating a child menu. */
  private _getChildOverlayInjector() {
    this._childOverlayInjector =
      this._childOverlayInjector ||
      Injector.create({
        providers: [
          { provide: OVERLAY_TRIGGER, useValue: this }
        ],
        parent: this.injector,
      });
    return this._childOverlayInjector;
  }

  ngOnDestroy() {
    this._backdropSubscription.unsubscribe();
    this._positionSubscription.unsubscribe();

    this.destroyed.next();
    this.destroyed.complete();

    if (this._overlayRef) {
      this._overlayRef.dispose();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this._position) {
      this._updatePositionStrategy(this._position);
      this._overlayRef?.updateSize({
        width: this.width,
        minWidth: this.minWidth,
        height: this.height,
        minHeight: this.minHeight,
      });

      if (changes['origin'] && this.open) {
        this._position.apply();
      }
    }
  }

  /** Creates an overlay */
  private _createOverlay() {
    const overlayRef = (this._overlayRef = this._overlay.create(this._buildConfig()));
    overlayRef.attachments().pipe(takeUntil(this.destroyed)).subscribe(() => this.attach.emit());
    overlayRef.detachments().pipe(takeUntil(this.destroyed)).subscribe(() => this.detach.emit());
    overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      this.overlayKeydown.next(event);

      if (event.key === 'Escape' && !this.disableClose && !hasModifierKey(event)) {
        event.preventDefault();
        this._detachOverlay();
      }
    });

    this._overlayRef.outsidePointerEvents().subscribe((event: MouseEvent) => {
      const target = _getEventTarget(event) as Element;
      const element = this.elementRef.nativeElement;
      if (target !== element && !element.contains(target)) {
        this.overlayOutsideClick.next(event);
        this._detachOverlay();
      }
    });
  }

  /** Builds the overlay config based on the directive's inputs */
  private _buildConfig(): OverlayConfig {
    const positionStrategy = (this._position =
      this.positionStrategy || this._createPositionStrategy());
    const overlayConfig = new OverlayConfig({
      direction: this._dir,
      positionStrategy,
      scrollStrategy: this.scrollStrategy,
      hasBackdrop: this.hasBackdrop,
    });

    if (this.width || this.width === 0) {
      overlayConfig.width = this.width;
    }

    if (this.height || this.height === 0) {
      overlayConfig.height = this.height;
    }

    if (this.minWidth || this.minWidth === 0) {
      overlayConfig.minWidth = this.minWidth;
    }

    if (this.minHeight || this.minHeight === 0) {
      overlayConfig.minHeight = this.minHeight;
    }

    if (this.backdropClass) {
      overlayConfig.backdropClass = this.backdropClass;
    }

    overlayConfig.panelClass = 'cdk-overlay-content';

    if (this.panelClass) {
      if (Array.isArray(this.panelClass)) {
        overlayConfig.panelClass = [...this.panelClass, overlayConfig.panelClass];
      } else {
        overlayConfig.panelClass = [this.panelClass, overlayConfig.panelClass];
      }
    }

    return overlayConfig;
  }

  private _updatePositionStrategy(positionStrategy: FlexibleConnectedPositionStrategy) {
    return positionStrategy
      .setOrigin(this.elementRef)
      .withPositions(STANDARD_DROPDOWN_BELOW_POSITIONS)
      .withFlexibleDimensions(this.flexibleDimensions)
      .withPush(this.push)
      .withGrowAfterOpen(this.growAfterOpen)
      .withViewportMargin(this.viewportMargin)
      .withLockedPosition(this.lockPosition)
      .withTransformOriginOn(this.transformOriginSelector);
  }

  /** Returns the position strategy of the overlay to be set on the overlay config */
  private _createPositionStrategy(): FlexibleConnectedPositionStrategy {
    const strategy = this._overlay
      .position()
      .flexibleConnectedTo(this.elementRef);
    this._updatePositionStrategy(strategy);
    return strategy;
  }

  /** Attaches the overlay and subscribes to backdrop clicks if backdrop exists */
  private _attachOverlay() {
    if (!this._overlayRef) {
      this._createOverlay();
    } else {
      // Update the overlay size, in case the directive's inputs have changed
      this._overlayRef.getConfig().hasBackdrop = this.hasBackdrop;
    }

    if (!this._overlayRef!.hasAttached()) {
      this._overlayRef!.attach(this.getOverlayContentPortal());
      this.showAnimation.create(this._overlayRef!.overlayElement).play();
    }

    if (this.hasBackdrop) {
      this._backdropSubscription = this._overlayRef!.backdropClick().subscribe(event => {
        this.backdropClick.emit(event);
      });
    } else {
      this._backdropSubscription.unsubscribe();
    }

    this._positionSubscription.unsubscribe();

    // Only subscribe to `positionChanges` if requested, because putting
    // together all the information for it can be expensive.
    if (this.positionChange.observers.length > 0) {
      this._positionSubscription = this._position.positionChanges
        .pipe(takeWhile(() => this.positionChange.observers.length > 0))
        .subscribe(position => {
          this.positionChange.emit(position);

          if (this.positionChange.observers.length === 0) {
            this._positionSubscription.unsubscribe();
          }
        });
    }
  }

  /** Detaches the overlay and unsubscribes to backdrop clicks if backdrop exists */
  private _detachOverlay() {
    if (this._overlayRef) {
      this._overlayRef.detach();
    }

    this._backdropSubscription.unsubscribe();
    this._positionSubscription.unsubscribe();
  }
}

/**
 * Directive to facilitate declarative creation of an
 * Overlay using a FlexibleConnectedPositionStrategy.
 */
@Directive({
  selector: '[appConnectedOverlay]',
  exportAs: 'appConnectedOverlay'
})
export class AppConnectedOverlay {
  constructor() { }
}

/** @docs-private */
export function APP_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY(
  overlay: Overlay,
): () => RepositionScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const APP_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER = {
  provide: APP_CONNECTED_OVERLAY_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: APP_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY,
};
