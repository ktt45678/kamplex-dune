// https://github.com/angular/components/blob/main/src/cdk/menu/menu-trigger.ts
import { Directive, ElementRef, inject, NgZone, OnDestroy } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { _getEventTarget } from '@angular/cdk/platform';
import { CDK_MENU, PARENT_OR_NEW_MENU_STACK_PROVIDER, MENU_AIM, CdkMenuTriggerBase, MENU_TRIGGER, Menu } from '@angular/cdk/menu';
import { ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayConfig, STANDARD_DROPDOWN_ADJACENT_POSITIONS, STANDARD_DROPDOWN_BELOW_POSITIONS } from '@angular/cdk/overlay';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { fromEvent, filter, takeUntil, take, delay, asapScheduler } from 'rxjs';

import { MenuDirective } from '../menu/menu.directive';

@Directive({
  selector: '[appMenuTriggerFor]',
  exportAs: 'appMenuTriggerFor',
  host: {
    'class': 'cdk-menu-trigger',
    '[attr.aria-haspopup]': 'menuTemplateRef ? "menu" : null',
    '[attr.aria-expanded]': 'menuTemplateRef == null ? null : isOpen()',
    '(focusin)': '_setHasFocus(true)',
    '(focusout)': '_setHasFocus(false)',
    '(keydown)': '_toggleOnKeydown($event)',
    '(click)': 'toggle()',
  },
  inputs: [
    'menuTemplateRef: appMenuTriggerFor',
    'menuPosition: appMenuPosition',
    'menuData: appMenuTriggerData',
  ],
  outputs: ['opened: cdkMenuOpened', 'closed: cdkMenuClosed'],
  providers: [
    { provide: MENU_TRIGGER, useExisting: MenuTriggerDirective },
    PARENT_OR_NEW_MENU_STACK_PROVIDER,
  ]
})
export class MenuTriggerDirective extends CdkMenuTriggerBase implements OnDestroy {
  /** The host element. */
  private readonly _elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  /** The CDK overlay service. */
  private readonly _overlay = inject(Overlay);

  /** The Angular zone. */
  private readonly _ngZone = inject(NgZone);

  /** The parent menu this trigger belongs to. */
  private readonly _parentMenu = inject(CDK_MENU, { optional: true });

  /** The menu aim service used by this menu. */
  private readonly _menuAim = inject(MENU_AIM, { optional: true });

  /** The directionality of the page. */
  private readonly _directionality = inject(Directionality, { optional: true });

  constructor() {
    super();
    this._setRole();
    this._registerCloseHandler();
    this._subscribeToMenuStackClosed();
    this._subscribeToMouseEnter();
    //this._subscribeToMenuStackHasFocus();
    this._setType();
  }

  /** Toggle the attached menu. */
  toggle() {
    const isNotClosing = !this.getMenu()?.isAnimatingHide;
    if (this.isOpen() && isNotClosing) {
      this.close();
    } else {
      this.open();
    }
  }

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
    // If the menu is completely closed
    if (!this.isOpen() && this.menuTemplateRef != null) {
      this.opened.next();

      this.overlayRef = this.overlayRef || this._overlay.create(this._getOverlayConfig());
      this.overlayRef.attach(this.getMenuContentPortal());
      this._subscribeToOutsideClicks();

      const menu = this.getMenu()!;
      menu.playShowAnimation();
    }
  }

  close() {
    if (this.isOpen()) {
      const menu = this.getMenu()!;
      menu.playHideAnimation();
      menu.hideAnimationDone.pipe(take(1), delay(0, asapScheduler)).subscribe(() => {
        this.closed.next();
        // Detach overlay
        this.overlayRef!.detach();
      });
    }
    this._closeSiblingTriggers();
  }

  /**
   * Get a reference to the rendered Menu if the Menu is open and rendered in the DOM.
   */
  getMenu(): MenuDirective | undefined {
    return <MenuDirective | undefined>this.childMenu;
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

  /**
   * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
   * into.
   */
  private _subscribeToMouseEnter() {
    this._ngZone.runOutsideAngular(() => {
      fromEvent<PointerEvent>(this._elementRef.nativeElement, 'pointerenter')
        .pipe(
          filter((event) => event.pointerType === 'mouse' && !this.menuStack.isEmpty() &&
            // If not opening or the hide animation is running
            (!this.isOpen() || !!this.getMenu()?.isAnimatingHide)
          ),
          takeUntil(this.destroyed),
        )
        .subscribe(() => {
          // Closes any sibling menu items and opens the menu associated with this trigger.
          const toggleMenus = () =>
            this._ngZone.run(() => {
              this._closeSiblingTriggers();
              this.open();
            });

          if (this._menuAim) {
            this._menuAim.toggle(toggleMenus);
          } else {
            toggleMenus();
          }
        });
    });
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
    });
  }

  /** Build the position strategy for the overlay which specifies where to place the menu. */
  private _getOverlayPositionStrategy(): FlexibleConnectedPositionStrategy {
    return this._overlay
      .position()
      .flexibleConnectedTo(this._elementRef)
      .withLockedPosition()
      .withGrowAfterOpen()
      .withPositions(this._getOverlayPositions());
  }

  /** Get the preferred positions for the opened menu relative to the menu item. */
  private _getOverlayPositions(): ConnectedPosition[] {
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
          if (this.getMenu()?.isAnimatingHide)
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
    if (this.overlayRef) {
      this.overlayRef
        .outsidePointerEvents()
        .pipe(takeUntil(this.stopOutsideClicksListener))
        .subscribe(event => {
          const target = _getEventTarget(event) as Element;
          const element = this._elementRef.nativeElement;

          if (target !== element && !element.contains(target)) {
            if (!this.isElementInsideMenuStack(target)) {
              this.menuStack.closeAll();
            } else {
              this._closeSiblingTriggers();
            }
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
