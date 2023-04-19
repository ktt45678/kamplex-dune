import { Directive, ElementRef, EventEmitter, inject, Input, NgZone, OnDestroy, Output } from '@angular/core';
import { FocusNext, FocusableElement } from '@angular/cdk/menu';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusableOption } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { Directionality } from '@angular/cdk/bidi';
import { fromEvent, Subject, filter, takeUntil } from 'rxjs';

import { SlideMenuTriggerDirective } from '../slide-menu-trigger/slide-menu-trigger';
import { Toggler } from '../slide-menu-aim/slide-menu-aim.directive';
import { SLIDE_MENU_STACK } from '../slide-menu-stack/slide-menu-stack';
import { SLIDE_MENU } from '../slide-menu-interface';
import { SlideMenuOverlay } from '../slide-menu-overlay/slide-menu-overlay';

@Directive({
  selector: '[slideMenuItem]',
  exportAs: 'slideMenuItem',
  host: {
    'role': 'menuitem',
    'class': 'slide-menu-item',
    '[tabindex]': '_tabindex',
    '[attr.aria-disabled]': 'disabled || null',
    '(blur)': '_resetTabIndex()',
    '(focus)': '_setTabIndex()',
    '(click)': 'trigger({ keepOpen })',
    '(keydown)': '_onKeydown($event)',
  }
})
export class SlideMenuItem implements FocusableOption, FocusableElement, Toggler, OnDestroy {
  /** The directionality (text direction) of the current page. */
  protected readonly _dir = inject(Directionality, { optional: true });

  /** The menu's native DOM host element. */
  readonly _elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  /** The Angular zone. */
  protected _ngZone = inject(NgZone);

  /** The stack of menus this menu belongs to. */
  private readonly _menuStack = inject(SLIDE_MENU_STACK);

  /** The parent menu in which this menuitem resides. */
  private readonly _parentMenu = inject(SLIDE_MENU, { optional: true });

  /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
  private readonly _menuTrigger = inject(SlideMenuTriggerDirective, { optional: true, self: true });

  /**  Whether the CdkMenuItem is disabled - defaults to false */
  @Input('itemDisabled')
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  /**
   * The text used to locate this item during menu typeahead. If not specified,
   * the `textContent` of the item will be used.
   */
  @Input('menuitemTypeaheadLabel') typeaheadLabel!: string | null;

  /**
   * If this MenuItem is a regular MenuItem, outputs when it is triggered by a keyboard or mouse
   * event.
   */
  @Output('menuItemTriggered') readonly triggered: EventEmitter<void> = new EventEmitter();

  /** Whether the menu item opens a menu. */
  get hasMenu() {
    return this._menuTrigger?.menuTemplateRef != null;
  }

  /**
   * The tabindex for this menu item managed internally and used for implementing roving a
   * tab index.
   */
  _tabindex: 0 | -1 = -1;

  /** Whether the item should close the menu if triggered by the spacebar. */
  protected closeOnSpacebarTrigger = true;

  /** Whether the item should close the menu if triggered. */
  protected keepOpen = false;

  /** Emits when the menu item is destroyed. */
  protected readonly destroyed = new Subject<void>();

  constructor() {
    this._setupMouseEnter();
    this._setType();

    if (this._isStandaloneItem()) {
      this._tabindex = 0;
    }
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /** Place focus on the element. */
  focus() {
    this._elementRef.nativeElement.focus();
  }

  /**
   * If the menu item is not disabled and the element does not have a menu trigger attached, emit
   * on the cdkMenuItemTriggered emitter and close all open menus.
   * @param options Options the configure how the item is triggered
   *   - keepOpen: specifies that the menu should be kept open after triggering the item.
   */
  trigger(options?: { keepOpen: boolean }) {
    const { keepOpen } = { ...options };
    if (!this.disabled && !this.hasMenu) {
      this.triggered.next();
      if (!keepOpen) {
        this._menuStack.closeAll({ focusParentTrigger: true });
      }
    }
  }

  /** Return true if this MenuItem has an attached menu and it is open. */
  isMenuOpen() {
    return !!this._menuTrigger?.isOpen();
  }

  /**
   * Get a reference to the rendered Menu if the Menu is open and it is visible in the DOM.
   * @return the menu if it is open, otherwise undefined.
   */
  getMenu(): SlideMenuOverlay | undefined {
    return this._menuTrigger?.getMenu();
  }

  /** Get the CdkMenuTrigger associated with this element. */
  getMenuTrigger(): SlideMenuTriggerDirective | null {
    return this._menuTrigger;
  }

  /** Get the label for this element which is required by the FocusableOption interface. */
  getLabel(): string {
    return this.typeaheadLabel || this._elementRef.nativeElement.textContent?.trim() || '';
  }

  /** Reset the tabindex to -1. */
  _resetTabIndex() {
    if (!this._isStandaloneItem()) {
      this._tabindex = -1;
    }
  }

  /**
   * Set the tab index to 0 if not disabled and it's a focus event, or a mouse enter if this element
   * is not in a menu bar.
   */
  _setTabIndex(event?: MouseEvent) {
    if (this.disabled) {
      return;
    }

    // don't set the tabindex if there are no open sibling or parent menus
    if (!event || !this._menuStack.isEmpty()) {
      this._tabindex = 0;
    }
  }

  /**
   * Handles keyboard events for the menu item, specifically either triggering the user defined
   * callback or opening/closing the current menu based on whether the left or right arrow key was
   * pressed.
   * @param event the keyboard event to handle
   */
  _onKeydown(event: KeyboardEvent) {
    switch (event.code) {
      case 'Space':
        //case 'Enter':
        //case 'NumpadEnter':
        if (!hasModifierKey(event)) {
          this.trigger({ keepOpen: event.code === 'Space' && !this.closeOnSpacebarTrigger });
        }
        break;

      case 'ArrowRight':
        if (!hasModifierKey(event)) {
          if (this._parentMenu && this._isParentVertical()) {
            if (this._dir?.value !== 'rtl') {
              this._forwardArrowPressed(event);
            } else {
              this._backArrowPressed(event);
            }
          }
        }
        break;

      case 'ArrowLeft':
        if (!hasModifierKey(event)) {
          if (this._parentMenu && this._isParentVertical()) {
            if (this._dir?.value !== 'rtl') {
              this._backArrowPressed(event);
            } else {
              this._forwardArrowPressed(event);
            }
          }
        }
        break;
    }
  }

  /** Whether this menu item is standalone or within a menu or menu bar. */
  private _isStandaloneItem() {
    return !this._parentMenu;
  }

  /**
   * Handles the user pressing the back arrow key.
   * @param event The keyboard event.
   */
  private _backArrowPressed(event: KeyboardEvent) {
    const parentMenu = this._parentMenu!;
    if (this._menuStack.hasInlineMenu() || this._menuStack.length() > 1) {
      event.preventDefault();
      this._menuStack.close(parentMenu, {
        focusNextOnEmpty:
          this._menuStack.inlineMenuOrientation() === 'horizontal'
            ? FocusNext.previousItem
            : FocusNext.currentItem,
        focusParentTrigger: true,
      });
    }
  }

  /**
   * Handles the user pressing the forward arrow key.
   * @param event The keyboard event.
   */
  private _forwardArrowPressed(event: KeyboardEvent) {
    if (!this.hasMenu && this._menuStack.inlineMenuOrientation() === 'horizontal') {
      event.preventDefault();
      this._menuStack.closeAll({
        focusNextOnEmpty: FocusNext.nextItem,
        focusParentTrigger: true,
      });
    }
  }

  /**
   * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
   * into.
   */
  private _setupMouseEnter() {
    if (!this._isStandaloneItem()) {
      const closeOpenSiblings = () =>
        this._ngZone.run(() => this._menuStack.closeSubMenuOf(this._parentMenu!));

      this._ngZone.runOutsideAngular(() =>
        fromEvent(this._elementRef.nativeElement, 'mouseenter')
          .pipe(
            filter(() => !this._menuStack.isEmpty() && !this.hasMenu),
            takeUntil(this.destroyed),
          )
          .subscribe(() => {
            closeOpenSiblings();
          }),
      );
    }
  }

  /**
   * Return true if the enclosing parent menu is configured in a horizontal orientation, false
   * otherwise or if no parent.
   */
  private _isParentVertical() {
    return this._parentMenu?.orientation === 'vertical';
  }

  /** Sets the `type` attribute of the menu item. */
  private _setType() {
    const element = this._elementRef.nativeElement;

    if (element.nodeName === 'BUTTON' && !element.getAttribute('type')) {
      // Prevent form submissions.
      element.setAttribute('type', 'button');
    }
  }
}
