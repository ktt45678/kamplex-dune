// https://github.com/angular/components/blob/main/src/cdk/menu/menu.ts
import { AfterContentInit, Directive, ElementRef, EventEmitter, inject, InjectFlags, Input, OnDestroy, Output } from '@angular/core';
import { animate, AnimationBuilder, AnimationMetadata, AnimationPlayer, style } from '@angular/animations';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { CdkMenuGroup, CDK_MENU, FocusNext, PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER, MENU_TRIGGER } from '@angular/cdk/menu';
import { takeUntil } from 'rxjs';

import { MenuBase } from '../menu-base/menu-base.directive';

@Directive({
  selector: '[appMenu]',
  exportAs: 'appMenu',
  host: {
    'role': 'menu',
    'class': 'cdk-menu',
    '[class.cdk-menu-inline]': 'isInline',
    '(keydown)': '_handleKeyEvent($event)',
  },
  providers: [
    { provide: CdkMenuGroup, useExisting: MenuDirective },
    { provide: CDK_MENU, useExisting: MenuDirective },
    PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER('vertical'),
  ]
})
export class MenuDirective extends MenuBase implements AfterContentInit, OnDestroy {
  private _parentTrigger = inject(MENU_TRIGGER, InjectFlags.Optional);

  /** Event emitted when the menu is closed. */
  @Output() readonly closed: EventEmitter<void> = new EventEmitter();

  /** The direction items in the menu flow. */
  override readonly orientation = 'vertical';

  /** Whether the menu is displayed inline (i.e. always present vs a conditional popup that the user triggers with a trigger element). */
  override readonly isInline = !this._parentTrigger;

  setAnimation() {
    const factory = this.animationBuilder.build([
      style({ opacity: 0 }),
      animate('100ms ease-in', style({ opacity: 1 })),
    ]);
    const player = factory.create(this.el.nativeElement);
    player.play();
  }

  constructor(private animationBuilder: AnimationBuilder, private el: ElementRef) {
    super();
    this.destroyed.subscribe(this.closed);
    this._parentTrigger?.registerChildMenu(this);
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();
    this._subscribeToMenuStackEmptied();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.closed.complete();
  }

  /**
   * Handle keyboard events for the Menu.
   * @param event The keyboard event to be handled.
   */
  _handleKeyEvent(event: KeyboardEvent) {
    const keyManager = this.keyManager;
    switch (event.code) {
      case 'ArrowLeft':
      case 'ArrowRight':
        if (!hasModifierKey(event)) {
          event.preventDefault();
          keyManager.setFocusOrigin('keyboard');
          keyManager.onKeydown(event);
        }
        break;

      case 'Escape':
        if (!hasModifierKey(event)) {
          event.preventDefault();
          this.menuStack.close(this, {
            focusNextOnEmpty: FocusNext.currentItem,
            focusParentTrigger: true,
          });
        }
        break;

      case 'Tab':
        if (!hasModifierKey(event, 'altKey', 'metaKey', 'ctrlKey')) {
          this.menuStack.closeAll({ focusParentTrigger: true });
        }
        break;

      default:
        keyManager.onKeydown(event);
    }
  }

  /**
   * Set focus the either the current, previous or next item based on the FocusNext event.
   * @param focusNext The element to focus.
   */
  private _toggleMenuFocus(focusNext: FocusNext | undefined) {
    const keyManager = this.keyManager;
    switch (focusNext) {
      case FocusNext.nextItem:
        keyManager.setFocusOrigin('keyboard');
        keyManager.setNextItemActive();
        break;

      case FocusNext.previousItem:
        keyManager.setFocusOrigin('keyboard');
        keyManager.setPreviousItemActive();
        break;

      case FocusNext.currentItem:
        if (keyManager.activeItem) {
          keyManager.setFocusOrigin('keyboard');
          keyManager.setActiveItem(keyManager.activeItem);
        }
        break;
    }
  }

  /** Subscribe to the MenuStack emptied events. */
  private _subscribeToMenuStackEmptied() {
    this.menuStack.emptied
      .pipe(takeUntil(this.destroyed))
      .subscribe(event => this._toggleMenuFocus(event));
  }
}
