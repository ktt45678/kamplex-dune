import { Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Directionality } from '@angular/cdk/bidi';
import { _getEventTarget } from '@angular/cdk/platform';
import { ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayConfig, STANDARD_DROPDOWN_ADJACENT_POSITIONS, STANDARD_DROPDOWN_BELOW_POSITIONS } from '@angular/cdk/overlay';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { asapScheduler, delay, take, takeUntil } from 'rxjs';

import { SlideMenuOverlay } from '../slide-menu-overlay/slide-menu-overlay';
import { SLIDE_MENU_TRIGGER, SlideMenuTriggerBase } from '../slide-menu-trigger-base/slide-menu-trigger-base';
import { SLIDE_MENU } from '../slide-menu-interface';
import { PARENT_OR_NEW_SLIDE_MENU_STACK_PROVIDER } from '../slide-menu-stack/slide-menu-stack';

@Directive({
  selector: '[slideMenuTriggerFor]',
  exportAs: 'slideMenuTriggerFor',
  host: {
    'class': 'slide-menu-trigger',
    '[attr.aria-haspopup]': 'menuTemplateRef ? "menu" : null',
    '[attr.aria-expanded]': 'menuTemplateRef == null ? null : isOpen()',
    '(focusin)': '_setHasFocus(true)',
    '(focusout)': '_setHasFocus(false)',
    '(keydown)': '_toggleOnKeydown($event)',
    '(click)': 'toggle()',
  },
  inputs: [
    'menuTemplateRef: slideMenuTriggerFor',
    'menuPosition: menuPosition',
    'menuRelativeTo: menuRelativeTo',
    'offsetX: offsetX',
    'offsetY: offsetY',
    'lockedPosition: lockedPosition',
    'flexibleDimensions: flexibleDimensions',
    'backdropClass: backdropClass',
    'fixedBottom: fixedBottom',
    'menuData: menuTriggerData',
  ],
  outputs: ['opened: menuOpened', 'closed: menuClosed'],
  providers: [
    { provide: SLIDE_MENU_TRIGGER, useExisting: SlideMenuTriggerDirective },
    PARENT_OR_NEW_SLIDE_MENU_STACK_PROVIDER,
  ]
})
export class SlideMenuTriggerDirective extends SlideMenuTriggerBase implements OnDestroy {
  /** The document. */
  private readonly _document: Document = inject(DOCUMENT);

  /** The host element. */
  private readonly _elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  /** The CDK overlay service. */
  private readonly _overlay = inject(Overlay);

  /** The parent menu this trigger belongs to. */
  private readonly _parentMenu = inject(SLIDE_MENU, { optional: true });

  /** The directionality of the page. */
  private readonly _directionality = inject(Directionality, { optional: true });

  constructor() {
    super();
    this._setRole();
    this._registerCloseHandler();
    this._subscribeToMenuStackClosed();
    this._setType();
    this.menuStack.registerTrigger(this, this._elementRef);
    this.menuStack.registerViewRef(this.injector, this.viewContainerRef);
  }

  /** Toggle the attached menu. */
  toggle() {
    // Close if it's the primary trigger
    const isPrimaryTrigger = this.menuStack.isPrimaryTrigger(this._elementRef);
    const isNotClosing = !this.getMenu()?.isAnimatingHide;
    if (this.isOpen() && isPrimaryTrigger && isNotClosing) {
      this.close();
    } else {
      this.open();
    }
  }

  /** Open the attached menu. */
  open() {
    // Handle if the hide animation is running
    const isClosing = this.getMenu()?.isAnimatingHide;
    if (isClosing) {
      const menu = this.getMenu()!;
      menu.hideAnimationDone.pipe(take(1), delay(0, asapScheduler)).subscribe(() => {
        this.open();
      });
      return;
    }

    if (!this.isOpen() && this.menuTemplateRef != null) {
      this.opened.next();
    }

    // Get last menu height for transform animation
    let lastMenuHeight: number | undefined;

    // Create overlay
    this.menuStack.overlayRef = this.menuStack.overlayRef || this.menuStack.createOverlay(this._getOverlayConfig());

    if (this.menuStack.overlayRef.hasAttached()) {
      lastMenuHeight = this.menuStack.overlayRef.overlayElement.clientHeight;
      this.menuStack.overlayRef.detach();
      if (this.menuTemplateRef === this.menuStack.parentMenuRefs[this.menuStack.parentMenuRefs.length - 1])
        this.menuStack.parentMenuRefs.pop();
      // Prevent adding null and duplicated menu
      else if (this.menuStack.activeMenuRef !== null && this.menuStack.activeMenuRef !== this.menuTemplateRef)
        this.menuStack.parentMenuRefs.push(this.menuStack.activeMenuRef);
    }

    this.menuStack.overlayRef.attach(this.getMenuContentPortal());
    this.menuStack.activeMenuRef = this.menuTemplateRef;
    this._subscribeToOutsideClicks();

    const menu = this.getMenu()!;
    if (this.menuStack.isPrimaryTrigger(this._elementRef)) {
      menu.playShowAnimation();
    } else if (lastMenuHeight) {
      if (!this.menuStack.primaryTrigger?.fixedBottom) {
        menu.playSlideAnimation(lastMenuHeight);
      } else {
        menu.playFixedSlideAnimation();
      }
    }
  }

  /** Close the opened menu. */
  close() {
    if (this.isOpen()) {
      const menu = this.getMenu()!;
      menu.playHideAnimation();
      menu.hideAnimationDone.pipe(take(1), delay(0, asapScheduler)).subscribe(() => {
        this.closed.next();

        this.menuStack.overlayRef!.detach();
        this.menuStack.parentMenuRefs = [];
        this.menuStack.activeMenuRef = null;
      });
    }
    this._closeSiblingTriggers();
  }

  /**
   * Get a reference to the rendered Menu if the Menu is open and rendered in the DOM.
   */
  getMenu(): SlideMenuOverlay | undefined {
    return this.childMenu;
  }

  /**
   * Handles keyboard events for the menu item.
   * @param event The keyboard event to handle
   */
  _toggleOnKeydown(event: KeyboardEvent) {
    const isParentVertical = this._parentMenu?.orientation === 'vertical';
    const keyCode = event.code;

    const invokeFocusItem = (cb: () => void) => {
      const menu = this.getMenu();
      if (menu?.isAnimatingHide) {
        menu.hideAnimationDone.pipe(take(1), delay(0, asapScheduler)).subscribe(() => {
          cb();
        });
      } else {
        cb();
      }
    }

    switch (keyCode) {
      case 'Space':
      case 'Enter':
        if (!hasModifierKey(event)) {
          event.preventDefault();
          this.toggle();
          invokeFocusItem(() => this.childMenu?.focusFirstItem('keyboard'));
        }
        break;

      case 'ArrowRight':
        if (!hasModifierKey(event)) {
          if (this._parentMenu && isParentVertical && this._directionality?.value !== 'rtl') {
            event.preventDefault();
            this.open();
            invokeFocusItem(() => this.childMenu?.focusFirstItem('keyboard'));
          }
        }
        break;

      case 'ArrowLeft':
        if (!hasModifierKey(event)) {
          if (this._parentMenu && isParentVertical && this._directionality?.value === 'rtl') {
            event.preventDefault();
            this.open();
            invokeFocusItem(() => this.childMenu?.focusFirstItem('keyboard'));
          }
        }
        break;

      case 'ArrowDown':
      case 'ArrowUp':
        if (!hasModifierKey(event)) {
          if (!isParentVertical) {
            event.preventDefault();
            this.open();
            keyCode === 'ArrowDown'
              ? invokeFocusItem(() => this.childMenu?.focusFirstItem('keyboard'))
              : invokeFocusItem(() => this.childMenu?.focusLastItem('keyboard'));
          }
        }
        break;
    }
  }

  /**
   * Sets whether the trigger's menu stack has focus.
   * @param hasFocus Whether the menu stack has focus.
   */
  _setHasFocus(hasFocus: boolean) {
    if (!this._parentMenu) {
      this.menuStack.setHasFocus(hasFocus);
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.menuStack.isPrimaryTrigger(this._elementRef)) {
      this.menuStack.destroyOverlay();
    }
  }

  /** Close out any sibling menu trigger menus. */
  private _closeSiblingTriggers() {
    if (this._parentMenu) {
      // If nothing was removed from the stack and the last element is not the parent item
      // that means that the parent menu is a menu bar since we don't put the menu bar on the
      // stack
      const isParentMenuBar =
        !this.menuStack.closeSubMenuOf(this._parentMenu) &&
        this.menuStack.peek() !== this._parentMenu;

      if (isParentMenuBar) {
        this.menuStack.closeAll();
      }
    } else {
      this.menuStack.closeAll();
    }
  }

  /** Get the configuration object used to create the overlay. */
  private _getOverlayConfig() {
    return new OverlayConfig({
      positionStrategy: this._getOverlayPositionStrategy(),
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      direction: this._directionality || undefined,
      hasBackdrop: !!this.backdropClass,
      backdropClass: this.backdropClass || ''
    });
  }

  /** Build the position strategy for the overlay which specifies where to place the menu. */
  private _getOverlayPositionStrategy(): FlexibleConnectedPositionStrategy {
    const flexibleConnectedTo = this.menuRelativeTo === 'body' || this.fixedBottom ?
      this._document.body :
      (this.menuRelativeTo || this._elementRef);
    return this._overlay
      .position()
      .flexibleConnectedTo(flexibleConnectedTo)
      .withDefaultOffsetX(this.offsetX)
      .withDefaultOffsetY(this.offsetY)
      .withLockedPosition(this.lockedPosition)
      .withFlexibleDimensions(this.flexibleDimensions)
      .withGrowAfterOpen()
      .withPositions(this._getOverlayPositions());
  }

  /** Get the preferred positions for the opened menu relative to the menu item. */
  private _getOverlayPositions(): ConnectedPosition[] {
    if (this.fixedBottom) {
      return [{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'bottom' }];
    }
    return (
      this.menuPosition ??
      (!this._parentMenu || this._parentMenu.orientation === 'horizontal'
        ? STANDARD_DROPDOWN_BELOW_POSITIONS
        : STANDARD_DROPDOWN_ADJACENT_POSITIONS)
    );
  }

  /**
   * Subscribe to the MenuStack close events if this is a standalone trigger and close out the menu
   * this triggers when requested.
   */
  private _registerCloseHandler() {
    if (!this._parentMenu) {
      this.menuStack.closed.pipe(takeUntil(this.destroyed)).subscribe(({ item }) => {
        if (item === this.childMenu) {
          if (this.childMenu.isAnimatingHide)
            return;
          this.close();
        }
      });
    }
  }

  /**
   * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
   * click occurs outside the menus.
   */
  private _subscribeToOutsideClicks() {
    if (this.menuStack.overlayRef) {
      if (this.menuStack.outsideClickSubscription && !this.menuStack.outsideClickSubscription.closed)
        this.menuStack.outsideClickSubscription.unsubscribe();
      this.menuStack.outsideClickSubscription = this.menuStack.overlayRef
        .outsidePointerEvents()
        .pipe(takeUntil(this.stopOutsideClicksListener))
        .subscribe(event => {
          const target = _getEventTarget(event) as Element;
          const element = this._elementRef.nativeElement;

          if (target !== element && !element.contains(target)) {
            if (event instanceof PointerEvent) {
              // Stop event on outside click (left mouse and touch)
              if ((event.pointerType === 'mouse' || event.pointerType === 'touch') && event.button === 0) {
                event.preventDefault();
                event.stopPropagation();
              }
            }
            this.menuStack.closeAll();
          }
        });
    }
  }

  /** Subscribe to the MenuStack hasFocus events. */
  private _subscribeToMenuStackHasFocus() {
    if (!this._parentMenu) {
      this.menuStack.hasFocus.pipe(takeUntil(this.destroyed)).subscribe(hasFocus => {
        if (!hasFocus) {
          this.menuStack.closeAll();
        }
      });
    }
  }

  /** Subscribe to the MenuStack closed events. */
  private _subscribeToMenuStackClosed() {
    if (!this._parentMenu) {
      this.menuStack.closed.subscribe(({ focusParentTrigger }) => {
        if (focusParentTrigger && !this.menuStack.length()) {
          this._elementRef.nativeElement.focus();
        }
      });
    }
  }

  /** Sets the role attribute for this trigger if needed. */
  private _setRole() {
    // If this trigger is part of another menu, the cdkMenuItem directive will handle setting the
    // role, otherwise this is a standalone trigger, and we should ensure it has role="button".
    if (!this._parentMenu) {
      this._elementRef.nativeElement.setAttribute('role', 'button');
    }
  }

  /** Sets thte `type` attribute of the trigger. */
  private _setType() {
    const element = this._elementRef.nativeElement;

    if (element.nodeName === 'BUTTON' && !element.getAttribute('type')) {
      // Prevents form submissions.
      element.setAttribute('type', 'button');
    }
  }
}
