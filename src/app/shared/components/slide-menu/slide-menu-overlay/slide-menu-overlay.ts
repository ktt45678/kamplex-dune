import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ElementRef, EventEmitter, inject, Input, NgZone, OnDestroy, Output, QueryList, Renderer2, ViewChild } from '@angular/core';
import { FocusKeyManager, FocusOrigin } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { CdkMenuGroup, FocusNext } from '@angular/cdk/menu';
import { animate, AnimationBuilder, AnimationFactory, style } from '@angular/animations';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { merge, Subject, mergeAll, mergeMap, startWith, switchMap, takeUntil, map } from 'rxjs';

import { SlideMenuItem } from '../slide-menu-item/slide-menu-item';
import { SLIDE_MENU_TRIGGER } from '../slide-menu-trigger-base/slide-menu-trigger-base';
import { SlideMenuTriggerDirective } from '../slide-menu-trigger/slide-menu-trigger';
import { PARENT_OR_NEW_INLINE_SLIDE_MENU_STACK_PROVIDER, SLIDE_MENU_STACK, SlideMenuStack, SlideMenuStackItem } from '../slide-menu-stack/slide-menu-stack';
import { SLIDE_MENU, SlideMenu } from '../slide-menu-interface';

let nextId = 0;

@Component({
  selector: 'app-slide-menu',
  exportAs: 'appSlideMenu',
  template: `
    <ng-container *ngIf="menuStack.parentMenuRefs.length">
      <div class="tw-flex">
        <button #previousButton="slideMenuTriggerFor" class="slide-menu-previous" slideMenuItemButton
          [slideMenuTriggerFor]="menuStack.parentMenuRefs[menuStack.parentMenuRefs.length - 1]">
          <i class="ms ms-icon-sm ms-navigate-before"></i>
          <span>{{ backLabel }}</span>
        </button>
        <ng-content select="header-options"></ng-content>
      </div>
      <div class="tw-divider tw-my-2"></div>
    </ng-container>
    <ng-content></ng-content>
  `,
  host: {
    'role': 'menu',
    'class': 'slide-menu p-scrollbar tw-overflow-y-auto',
    '[class.slide-menu-inline]': 'isInline',
    '[tabindex]': '_getTabIndex()',
    '[id]': 'id',
    '[attr.aria-orientation]': 'orientation',
    '[attr.data-slide-menu-stack-id]': 'menuStack.id',
    '(focusin)': 'menuStack.setHasFocus(true)',
    '(focusout)': 'menuStack.setHasFocus(false)',
    '(keydown)': '_handleKeyEvent($event)'
  },
  styleUrl: './slide-menu-overlay.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: CdkMenuGroup, useExisting: SlideMenuOverlay },
    { provide: SLIDE_MENU, useExisting: SlideMenuOverlay },
    PARENT_OR_NEW_INLINE_SLIDE_MENU_STACK_PROVIDER('vertical'),
  ]
})
export class SlideMenuOverlay extends CdkMenuGroup implements SlideMenu, AfterContentInit, OnDestroy {
  private _parentTrigger = inject(SLIDE_MENU_TRIGGER, { optional: true });

  /** The menu's native DOM host element. */
  readonly nativeElement: HTMLElement = inject(ElementRef).nativeElement;

  /** The Angular zone. */
  protected ngZone = inject(NgZone);

  /** The stack of menus this menu belongs to. */
  readonly menuStack: SlideMenuStack = inject(SLIDE_MENU_STACK);

  /** The directionality (text direction) of the current page. */
  protected readonly dir = inject(Directionality, { optional: true });

  /** The id of the menu's host element. */
  @Input() id = `slide-menu-${nextId++}`;

  /** The label of the menu's back button. */
  @Input() backLabel = 'Back';

  /** Event emitted when the menu is closed. */
  @Output() readonly closed: EventEmitter<void> = new EventEmitter();

  @ViewChild('previousButton') previousButton?: SlideMenuTriggerDirective;

  /** All child MenuItem elements nested in this Menu. */
  @ContentChildren(SlideMenuItem, { descendants: true })
  readonly items!: QueryList<SlideMenuItem>;

  /** The direction items in the menu flow. */
  orientation: 'horizontal' | 'vertical' = 'vertical';

  /**
   * Whether the menu is displayed inline (i.e. always present vs a conditional popup that the
   * user triggers with a trigger element).
   */
  isInline = !this._parentTrigger;

  /** Handles keyboard events for the menu. */
  protected keyManager!: FocusKeyManager<SlideMenuItem>;

  /** Emits when the MenuBar is destroyed. */
  protected readonly destroyed: Subject<void> = new Subject();

  /** The Menu Item which triggered the open submenu. */
  protected triggerItem?: SlideMenuItem;

  /** Whether this menu's menu stack has focus. */
  private _menuStackHasFocus = false;

  /** Emits whenever an animation on the menu completes. */
  readonly hideAnimationDone = new Subject<void>();

  /** Whether the menu is animating. */
  isAnimatingHide: boolean = false;

  private showAnimation: AnimationFactory;
  private hideAnimation: AnimationFactory;
  private slideAnimation: AnimationFactory;
  private fixedSlideAnimation: AnimationFactory;

  constructor(public cd: ChangeDetectorRef, private animationBuilder: AnimationBuilder, private renderer: Renderer2,
    private el: ElementRef<HTMLElement>) {
    super();
    this.destroyed.subscribe(this.closed);
    this._parentTrigger?.registerChildMenu(this);
    this.showAnimation = this.animationBuilder.build([
      style({ opacity: 0 }),
      animate('200ms ease', style({ opacity: 1 })),
    ]);
    this.hideAnimation = this.animationBuilder.build([
      style({ opacity: 1 }),
      animate('200ms ease', style({ opacity: 0 })),
    ]);
    this.slideAnimation = this.animationBuilder.build([
      style({ height: '{{ fromHeight }}' }),
      animate('200ms ease', style({ height: '{{ toHeight }}' }))
    ]);
    this.fixedSlideAnimation = this.animationBuilder.build([
      style({ transform: 'translateY({{ toHeight }})' }),
      animate('200ms ease', style({ transform: 'translateY(0)' }))
    ]);
  }

  ngAfterContentInit() {
    if (!this.isInline) {
      this.menuStack.push(this);
    }
    this._setKeyManager();
    this._subscribeToMenuStackHasFocus();
    this._subscribeToMenuOpen();
    this._subscribeToMenuStackClosed();
    this._subscribeToMenuStackEmptied();
  }

  ngOnDestroy() {
    this.keyManager?.destroy();
    this.destroyed.next();
    this.destroyed.complete();
    this.closed.complete();
    this.hideAnimationDone.complete();
  }

  playShowAnimation() {
    const player = this.showAnimation.create(this.el.nativeElement);
    player.play();
  }

  playHideAnimation() {
    const player = this.hideAnimation.create(this.el.nativeElement);
    player.onDone(() => {
      this.hideAnimationDone.next();
      this.isAnimatingHide = false;
    });
    player.play();
    this.isAnimatingHide = true;
  }

  playSlideAnimation(fromHeight: number) {
    //const toWidth = this.el.nativeElement.clientWidth + 'px';
    const toHeight = this.el.nativeElement.clientHeight;
    const player = this.slideAnimation.create(this.el.nativeElement, {
      params: {
        fromHeight: fromHeight + 'px',
        toHeight: toHeight + 'px'
      }
    });
    player.onStart(() => {
      this.renderer.setStyle(this.el.nativeElement, 'overflow-y', 'hidden');
    });
    player.onDone(() => {
      this.renderer.removeStyle(this.el.nativeElement, 'overflow-y');
    });
    player.play();
  }

  playFixedSlideAnimation() {
    const toHeight = this.el.nativeElement.clientHeight;
    const player = this.fixedSlideAnimation.create(this.el.nativeElement, {
      params: {
        toHeight: toHeight + 'px'
      }
    });
    player.play();
  }

  /**
   * Place focus on the first MenuItem in the menu and set the focus origin.
   * @param focusOrigin The origin input mode of the focus event.
   */
  focusFirstItem(focusOrigin: FocusOrigin = 'program') {
    this.keyManager.setFocusOrigin(focusOrigin);
    this.keyManager.setFirstItemActive();
  }

  /**
   * Place focus on the last MenuItem in the menu and set the focus origin.
   * @param focusOrigin The origin input mode of the focus event.
   */
  focusLastItem(focusOrigin: FocusOrigin = 'program') {
    this.keyManager.setFocusOrigin(focusOrigin);
    this.keyManager.setLastItemActive();
  }

  /** Gets the tabindex for this menu. */
  _getTabIndex() {
    const tabindexIfInline = this._menuStackHasFocus ? -1 : 0;
    return this.isInline ? tabindexIfInline : null;
  }

  /**
   * Close the open menu if the current active item opened the requested MenuStackItem.
   * @param menu The menu requested to be closed.
   * @param options Options to configure the behavior on close.
   *   - `focusParentTrigger` Whether to focus the parent trigger after closing the menu.
   */
  protected closeOpenMenu(menu: SlideMenuStackItem, options?: { focusParentTrigger?: boolean }) {
    const { focusParentTrigger } = { ...options };
    const keyManager = this.keyManager;
    const trigger = this.triggerItem;
    if (menu === trigger?.getMenuTrigger()?.getMenu()) {
      trigger?.getMenuTrigger()?.close();
      // If the user has moused over a sibling item we want to focus the element under mouse focus
      // not the trigger which previously opened the now closed menu.
      if (focusParentTrigger) {
        if (trigger) {
          keyManager.setActiveItem(trigger);
        } else {
          keyManager.setFirstItemActive();
        }
      }
    }
  }

  /** Setup the FocusKeyManager with the correct orientation for the menu. */
  private _setKeyManager() {
    this.keyManager = new FocusKeyManager(this.items).withWrap().withTypeAhead().withHomeAndEnd();

    if (this.orientation === 'horizontal') {
      this.keyManager.withHorizontalOrientation(this.dir?.value || 'ltr');
    } else {
      this.keyManager.withVerticalOrientation();
    }
  }

  /**
   * Subscribe to the menu trigger's open events in order to track the trigger which opened the menu
   * and stop tracking it when the menu is closed.
   */
  private _subscribeToMenuOpen() {
    const exitCondition = merge(this.items.changes, this.destroyed);
    this.items.changes
      .pipe(
        startWith(this.items),
        mergeMap((list: QueryList<SlideMenuItem>) =>
          list
            .filter(item => item.hasMenu)
            .map(item => item.getMenuTrigger()!.opened.pipe(map(() => item), takeUntil(exitCondition))),
        ),
        mergeAll(),
        switchMap((item: SlideMenuItem) => {
          this.triggerItem = item;
          return item.getMenuTrigger()!.closed;
        }),
        takeUntil(this.destroyed),
      )
      .subscribe(() => (this.triggerItem = undefined));
  }

  /** Subscribe to the MenuStack close events. */
  private _subscribeToMenuStackClosed() {
    this.menuStack.closed
      .pipe(takeUntil(this.destroyed))
      .subscribe(({ item, focusParentTrigger }) => this.closeOpenMenu(item, { focusParentTrigger }));
  }

  /** Subscribe to the MenuStack hasFocus events. */
  private _subscribeToMenuStackHasFocus() {
    if (this.isInline) {
      this.menuStack.hasFocus.pipe(takeUntil(this.destroyed)).subscribe(hasFocus => {
        this._menuStackHasFocus = hasFocus;
      });
    }
  }

  /**
   * Handle keyboard events for the Menu.
   * @param event The keyboard event to be handled.
   */
  _handleKeyEvent(event: KeyboardEvent) {
    const keyManager = this.keyManager;
    switch (event.code) {
      case 'ArrowLeft':
        if (this.previousButton) {
          event.preventDefault();
          this.previousButton.open();
          this.previousButton.getMenu()?.focusFirstItem('keyboard');
        }
        break;

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
          this.menuStack.closeAll({ focusParentTrigger: true, });
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
