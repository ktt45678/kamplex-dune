/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { DOCUMENT } from '@angular/common';
import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput, NumberInput, coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { Platform, _getEventTarget, normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import { AfterViewInit, Directive, ElementRef, EventEmitter, inject, Inject, InjectionToken, Injector, Input, NgZone, OnChanges, OnDestroy, Optional, Output, SimpleChanges, TemplateRef, ViewContainerRef, } from '@angular/core';
import { Subject, Subscription, asapScheduler, fromEvent } from 'rxjs';
import { delay, take, takeUntil, takeWhile } from 'rxjs/operators';
import {
  Overlay, OverlayConfig, OverlayRef, ConnectedOverlayPositionChange, FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin, RepositionScrollStrategy, ScrollStrategy, STANDARD_DROPDOWN_BELOW_POSITIONS,
  ConnectedPosition, STANDARD_DROPDOWN_ADJACENT_POSITIONS
} from '@angular/cdk/overlay';
import { FocusMonitor } from '@angular/cdk/a11y';
import { animate, AnimationBuilder, AnimationFactory, style } from '@angular/animations';

/**
 * Options for how the overlay trigger should handle touch gestures.
 */
export type OverlayTouchGestures = 'auto' | 'on' | 'off';

/** Injection token that determines the scroll handling while the connected overlay is open. */
export const APP_CONNECTED_OVERLAY_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
  'app-connected-overlay-scroll-strategy',
);

/** Injection token for overlay trigger. */
export const OVERLAY_TRIGGER = new InjectionToken<AppOverlayOrigin>('app-overlay-trigger');

/** Options used to bind passive event listeners. */
const passiveListenerOptions = normalizePassiveListenerOptions({ passive: true });

/**
 * Time between the user putting the pointer on a overlay
 * trigger and the long press event being fired.
 */
const LONGPRESS_DELAY = 500;

/**
 * Directive applied to an element to make it usable as an origin for an Overlay using a
 * ConnectedPositionStrategy.
 */
@Directive({
  selector: '[appOverlayOrigin]',
  exportAs: 'appOverlayOrigin'
})
export class AppOverlayOrigin implements AfterViewInit, OnChanges, OnDestroy {
  private injector = inject(Injector);
  private _overlay = inject(Overlay);
  private _hasBackdrop = false;
  private _lockPosition = true;
  private _growAfterOpen = false;
  private _flexibleDimensions = false;
  private _push = false;
  private _disabled = false;
  private _triggerEvent = 'click';
  private _viewInitialized = false;
  private _pointerExitEventsInitialized = false;
  private _backdropSubscription = Subscription.EMPTY;
  private _positionSubscription = Subscription.EMPTY;
  private _offsetX!: number;
  private _offsetY!: number;
  private _position!: FlexibleConnectedPositionStrategy;
  private _showTimeoutId: number | null = null;
  private _hideTimeoutId: number | null = null;
  private _scrollStrategyFactory: () => ScrollStrategy;
  private showAnimation: AnimationFactory;
  private hideAnimation: AnimationFactory;

  /** Emits whenever an animation on the menu completes. */
  readonly hideAnimationDone = new Subject<void>();

  /** Whether the menu is animating. */
  isAnimatingHide: boolean = false;

  /** A reference to the overlay */
  private _overlayRef: OverlayRef | null = null;

  /** The content of the overlay panel opened by this trigger. */
  private _overlayPortal!: TemplatePortal;

  /** The injector to use for the child overlay opened by this trigger. */
  private _childOverlayInjector?: Injector;

  /** Timer started at the last `touchstart` event. */
  private _touchstartTimeout?: ReturnType<typeof setTimeout>;

  /** Emits when this trigger is destroyed. */
  private readonly destroyed: Subject<void> = new Subject();

  /** Manually-bound passive event listeners. */
  private readonly _passiveListeners: (readonly [string, EventListenerOrEventListenerObject])[] = [];

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

  /** Disables the display of the overlay. */
  @Input('overlayDisabled')
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);

    // If overlay is disabled, hide immediately.
    if (this._disabled) {
      this._detachOverlay();
    } else {
      this.registerEvents();
    }
  }

  /** The event of the trigger to toggle the overlay. */
  @Input('overlayTriggerEvent')
  get triggerEvent(): string {
    return this._triggerEvent;
  }
  set triggerEvent(value: string) {
    this._triggerEvent = value;
  }

  /** The default delay in ms before showing the tooltip after show is called */
  @Input('overlayShowDelay')
  get showDelay(): number | undefined {
    return this._showDelay;
  }

  set showDelay(value: NumberInput) {
    this._showDelay = coerceNumberProperty(value);
  }

  private _showDelay?: number;

  /** The default delay in ms before hiding the tooltip after hide is called */
  @Input('overlayHideDelay')
  get hideDelay(): number | undefined {
    return this._hideDelay;
  }

  set hideDelay(value: NumberInput) {
    this._hideDelay = coerceNumberProperty(value);
  }

  private _hideDelay?: number;

  /** The default delay in ms before hiding the tooltip after hide is called */
  @Input('overlayMouseLeaveDelay')
  get mouseLeaveDelay(): number | undefined {
    return this._mouseLeaveDelay;
  }

  set mouseLeaveDelay(value: NumberInput) {
    this._mouseLeaveDelay = coerceNumberProperty(value);
  }

  private _mouseLeaveDelay: number = 200;

  /** Data to be passed along to any lazily-rendered content. */
  @Input('overlayData')
  get overlayData(): any {
    return this._overlayData;
  }

  set overlayData(value: any) {
    this._overlayData = value;
  }

  private _overlayData: any;

  @Input('overlayTouchGestures') touchGestures: OverlayTouchGestures = 'auto';

  @Input('overlayTriggerOn') triggerOn: 'click' | 'hover' = 'click';

  /**
   * A list of preferred overlay positions to be used when constructing the
   * `FlexibleConnectedPositionStrategy` for this trigger's overlay.
   */
  @Input() overlayPosition?: ConnectedPosition[];

  /** The direction items in the overlay flow. */
  @Input() overlayOrientation?: 'horizontal' | 'vertical';

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
    public elementRef: ElementRef<HTMLElement>,
    private viewContainerRef: ViewContainerRef,
    private ngZone: NgZone,
    private focusMonitor: FocusMonitor,
    private animationBuilder: AnimationBuilder,
    private platform: Platform,
    @Inject(DOCUMENT) private document: Document,
    @Inject(APP_CONNECTED_OVERLAY_SCROLL_STRATEGY) scrollStrategyFactory: any,
    @Optional() private _dir: Directionality
  ) {
    this._scrollStrategyFactory = scrollStrategyFactory;
    this.scrollStrategy = this._scrollStrategyFactory();
    this.showAnimation = this.animationBuilder.build([
      style({ opacity: 0 }),
      animate('200ms ease', style({ opacity: 1 })),
    ]);
    this.hideAnimation = this.animationBuilder.build([
      style({ opacity: 1 }),
      animate('200ms ease', style({ opacity: 0 })),
    ]);
  }

  ngAfterViewInit(): void {
    this._viewInitialized = true;
    this.registerEvents();
  }

  playShowAnimation() {
    const player = this.showAnimation.create(this._overlayRef!.overlayElement);
    player.play();
  }

  playHideAnimation() {
    const player = this.hideAnimation.create(this._overlayRef!.overlayElement);
    player.onDone(() => {
      this.hideAnimationDone.next();
      this.isAnimatingHide = false;
    });
    this.isAnimatingHide = true;
    player.play();
  }

  private registerEvents() {
    if (this.triggerOn === 'click') {
      this.registerClickEvent();
    } else {
      this.registerHoverEvent();
    }
  }

  private registerClickEvent() {
    fromEvent(this.elementRef.nativeElement, 'click').pipe(takeUntil(this.destroyed)).subscribe(() => {
      this.toggle();
    });
  }

  private registerHoverEvent() {
    this._setupPointerEnterEventsIfNeeded();
    this.focusMonitor
      .monitor(this.elementRef)
      .pipe(takeUntil(this.destroyed))
      .subscribe(origin => {
        // Note that the focus monitor runs outside the Angular zone.
        if (!origin) {
          this.ngZone.run(() => this.hide());
        } else if (origin === 'keyboard') {
          this.ngZone.run(() => this.show());
        }
      });
  }

  /** Binds the pointer events to the tooltip trigger. */
  private _setupPointerEnterEventsIfNeeded() {
    // Optimization: Defer hooking up events if there's no message or the tooltip is disabled.
    if (this._disabled || !this._viewInitialized || this._passiveListeners.length)
      return;

    // The mouse events shouldn't be bound on mobile devices, because they can prevent the
    // first tap from firing its click event or can cause the tooltip to open for clicks.
    if (this._platformSupportsMouseEvents()) {
      this._passiveListeners.push([
        'mouseenter', () => {
          this._setupPointerExitEventsIfNeeded();
          this.show();
        }
      ]);
    } else if (this.touchGestures !== 'off') {
      this._disableNativeGesturesIfNecessary();

      this._passiveListeners.push([
        'touchstart', () => {
          // Note that it's important that we don't `preventDefault` here,
          // because it can prevent click events from firing on the element.
          this._setupPointerExitEventsIfNeeded();
          clearTimeout(this._touchstartTimeout);
          this._touchstartTimeout = setTimeout(() => this.show(), LONGPRESS_DELAY);
        }
      ]);
    }

    this._addListeners(this._passiveListeners);
  }

  private _setupPointerExitEventsIfNeeded() {
    if (this._pointerExitEventsInitialized) {
      return;
    }
    this._pointerExitEventsInitialized = true;

    const exitListeners: (readonly [string, EventListenerOrEventListenerObject])[] = [];
    if (this._platformSupportsMouseEvents()) {
      // Overlay mouse leave event
      const handleMouseLeave = (overlayEvent: Event) => {
        const overlayNewTarget = (overlayEvent as MouseEvent).relatedTarget as Node | null;
        // Close when not going back to hover the trigger
        if (overlayNewTarget !== this.elementRef.nativeElement) {
          this.hide();
        }
      }
      exitListeners.push(
        [
          'mouseleave', event => {
            const newTarget = (event as MouseEvent).relatedTarget as Node | null;
            if (!newTarget || !this._overlayRef?.overlayElement.contains(newTarget)) {
              // Instead of hiding immediately, wait for mouse enter on the overlay element for a specific time
              let enteredOverlay = false;
              if (this._overlayRef?.overlayElement) {
                const handleOverlayMouseEnter = () => { enteredOverlay = true; }
                this._overlayRef.overlayElement.addEventListener('mouseenter', handleOverlayMouseEnter, { once: true, passive: true });
                setTimeout(() => {
                  if (!enteredOverlay) {
                    this._overlayRef!.overlayElement.removeEventListener('mouseenter', handleOverlayMouseEnter);
                    this.hide();
                  } else {
                    this._overlayRef!.overlayElement.addEventListener('mouseleave', handleMouseLeave, { once: true, passive: true });
                  }
                }, this._mouseLeaveDelay);
              } else {
                this.hide();
              }
            } else if (this._overlayRef?.overlayElement.contains(newTarget)) {
              // Close when leaving the overlay itself
              this._overlayRef!.overlayElement.addEventListener('mouseleave', handleMouseLeave, { once: true, passive: true });
            }
          }
        ],
        ['wheel', event => this._wheelListener(event as WheelEvent)]
      );
    } else if (this.touchGestures !== 'off') {
      this._disableNativeGesturesIfNecessary();
      const touchendListener = () => {
        clearTimeout(this._touchstartTimeout);
        this.hide(); // Insert delay option
      };
      exitListeners.push(['touchend', touchendListener], ['touchcancel', touchendListener]);
    }

    this._addListeners(exitListeners);
    this._passiveListeners.push(...exitListeners);
  }

  private _addListeners(listeners: (readonly [string, EventListenerOrEventListenerObject])[]) {
    listeners.forEach(([event, listener]) => {
      this.elementRef.nativeElement.addEventListener(event, listener, passiveListenerOptions);
    });
  }

  private _platformSupportsMouseEvents() {
    return !this.platform.IOS && !this.platform.ANDROID;
  }

  /** Listener for the `wheel` event on the element. */
  private _wheelListener(event: WheelEvent) {
    if (this.isOpen()) {
      const elementUnderPointer = this.document.elementFromPoint(event.clientX, event.clientY);
      const element = this.elementRef.nativeElement;

      // On non-touch devices we depend on the `mouseleave` event to close the tooltip, but it
      // won't fire if the user scrolls away using the wheel without moving their cursor. We
      // work around it by finding the element under the user's cursor and closing the tooltip
      // if it's not the trigger.
      if (elementUnderPointer !== element && !element.contains(elementUnderPointer)) {
        this.hide();
      }
    }
  }

  /** Disables the native browser gestures, based on how the tooltip has been configured. */
  private _disableNativeGesturesIfNecessary() {
    const gestures = this.touchGestures;

    if (gestures !== 'off') {
      const element = this.elementRef.nativeElement;
      const style = element.style;

      // If gestures are set to `auto`, we don't disable text selection on inputs and
      // textareas, because it prevents the user from typing into them on iOS Safari.
      if (gestures === 'on' || (element.nodeName !== 'INPUT' && element.nodeName !== 'TEXTAREA')) {
        style.userSelect =
          (style as any).msUserSelect =
          style.webkitUserSelect =
          (style as any).MozUserSelect =
          'none';
      }

      // If we have `auto` gestures and the element uses native HTML dragging,
      // we don't set `-webkit-user-drag` because it prevents the native behavior.
      if (gestures === 'on' || !element.draggable) {
        (style as any).webkitUserDrag = 'none';
      }

      style.touchAction = 'none';
      (style as any).webkitTapHighlightColor = 'transparent';
    }
  }

  /** Whether the overlay is open. */
  isOpen() {
    return !!this._overlayRef?.hasAttached();
  }

  /** Toggle the attached overlay. */
  toggle() {
    if (this.isOpen() && !this.isAnimatingHide) {
      this.hide();
    } else {
      this.show();
    }
  }

  private getOverlayContentPortal() {
    const hasOverlayContentChanged = this.overlayTemplateRef !== this._overlayPortal?.templateRef;
    const templateContext = { overlayData: this._overlayData };
    if (this.overlayTemplateRef && (!this._overlayPortal || hasOverlayContentChanged)) {
      this._overlayPortal = new TemplatePortal(
        this.overlayTemplateRef,
        this.viewContainerRef,
        templateContext,
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

    if (this._showTimeoutId) {
      clearTimeout(this._showTimeoutId);
      this._showTimeoutId = null;
    }

    if (this._hideTimeoutId) {
      clearTimeout(this._hideTimeoutId);
      this._hideTimeoutId = null;
    }

    if (this._overlayRef) {
      this._overlayRef.dispose();
    }

    // Hover events
    clearTimeout(this._touchstartTimeout);
    // Clean up the event listeners set in the constructor
    this._passiveListeners.forEach(([event, listener]) => {
      this.elementRef.nativeElement.removeEventListener(event, listener, passiveListenerOptions);
    });
    this._passiveListeners.length = 0;
    this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
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
      .withPositions(this._getOverlayPositions())
      .withDefaultOffsetX(this.offsetX)
      .withDefaultOffsetY(this.offsetY)
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

  /** Get the preferred positions for the opened menu relative to the menu item. */
  private _getOverlayPositions(): ConnectedPosition[] {
    return (
      this.overlayPosition ??
      (!this.overlayOrientation || this.overlayOrientation === 'horizontal'
        ? STANDARD_DROPDOWN_ADJACENT_POSITIONS
        : STANDARD_DROPDOWN_BELOW_POSITIONS)
    );
  }

  /**
   * Shows the overlay with an animation originating from the provided origin
   * @param delay Amount of milliseconds to the delay showing the overlay.
   */
  show(delay: number | undefined = this._showDelay) {
    // Cancel the delayed hide if it is scheduled
    if (this._hideTimeoutId !== null) {
      window.clearTimeout(this._hideTimeoutId);
    }

    this._showTimeoutId = window.setTimeout(() => {
      this._attachOverlay();
      this._showTimeoutId = null;
    }, delay);
  }

  /**
   * Begins the animation to hide the overlay after the provided delay in ms.
   * @param delay Amount of milliseconds to delay showing the overlay.
   */
  hide(delay: number | undefined = this._hideDelay) {
    // Cancel the delayed show if it is scheduled
    if (this._showTimeoutId !== null) {
      clearTimeout(this._showTimeoutId);
    }

    this._hideTimeoutId = window.setTimeout(() => {
      this._detachOverlay();
      this._hideTimeoutId = null;
    }, delay);
  }

  /** Attaches the overlay and subscribes to backdrop clicks if backdrop exists */
  private _attachOverlay() {
    // Handle if the hide animation is running
    if (this.isAnimatingHide) {
      this.hideAnimationDone.pipe(take(1), delay(0, asapScheduler), takeUntil(this.destroyed)).subscribe(() => {
        this._attachOverlay();
      });
      return;
    }

    if (!this._overlayRef) {
      this._createOverlay();
    } else {
      // Update the overlay size, in case the directive's inputs have changed
      this._overlayRef.getConfig().hasBackdrop = this.hasBackdrop;
    }

    if (!this._overlayRef!.hasAttached()) {
      this._overlayRef!.attach(this.getOverlayContentPortal());
      this.playShowAnimation();
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
    // Handle if the hide animation is running
    if (this.isAnimatingHide) {
      return;
    }

    if (this._overlayRef) {
      this.playHideAnimation();
      this.hideAnimationDone.pipe(take(1), delay(0, asapScheduler), takeUntil(this.destroyed)).subscribe(() => {
        this._overlayRef!.detach();
      });
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
