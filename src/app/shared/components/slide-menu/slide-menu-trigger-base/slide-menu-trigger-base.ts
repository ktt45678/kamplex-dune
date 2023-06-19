// https://github.com/angular/components/blob/main/src/cdk/menu/menu-trigger-base.ts
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Directive, EventEmitter, inject, InjectionToken, Injector, OnDestroy, TemplateRef, ViewContainerRef, } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { merge, Subject } from 'rxjs';
import { SLIDE_MENU_STACK, SlideMenuStack } from '../slide-menu-stack/slide-menu-stack';
import { SlideMenuOverlay } from '../slide-menu-overlay/slide-menu-overlay';

/** Injection token used for an implementation of MenuStack. */
export const SLIDE_MENU_TRIGGER = new InjectionToken<SlideMenuTriggerBase>('slide-menu-trigger');

/**
 * Abstract directive that implements shared logic common to all menu triggers.
 * This class can be extended to create custom menu trigger types.
 */
@Directive({
  host: {
    '[attr.aria-controls]': 'childMenu?.id',
    '[attr.data-slide-menu-stack-id]': 'menuStack.id',
  },
})
export abstract class SlideMenuTriggerBase implements OnDestroy {
  /** The DI injector for this component. */
  readonly injector = inject(Injector);

  /** The view container ref for this component */
  protected readonly viewContainerRef = inject(ViewContainerRef);

  /** The menu stack in which this menu resides. */
  protected readonly menuStack: SlideMenuStack = inject(SLIDE_MENU_STACK);

  /**
   * A list of preferred menu positions to be used when constructing the
   * `FlexibleConnectedPositionStrategy` for this trigger's menu.
   */
  menuPosition!: ConnectedPosition[];

  /** Emits when the attached menu is requested to open */
  readonly opened: EventEmitter<void> = new EventEmitter();

  /** Emits when the attached menu is requested to close */
  readonly closed: EventEmitter<void> = new EventEmitter();

  /** Template reference variable to the menu this trigger opens */
  menuTemplateRef!: TemplateRef<unknown> | null;

  /** Context data to be passed along to the menu template */
  menuData: unknown;

  /** Emits when this trigger is destroyed. */
  protected readonly destroyed: Subject<void> = new Subject();

  /** Emits when the outside pointer events listener on the overlay should be stopped. */
  protected readonly stopOutsideClicksListener = merge(this.closed, this.destroyed);

  /** The child menu opened by this trigger. */
  protected childMenu?: SlideMenuOverlay;

  /** The content of the menu panel opened by this trigger. */
  private _menuPortal!: TemplatePortal;

  /** The injector to use for the child menu opened by this trigger. */
  private _childMenuInjector?: Injector;

  menuRelativeTo?: HTMLElement | 'body';

  offsetX: number = 0;

  offsetY: number = 0;

  lockedPosition: boolean = true;

  flexibleDimensions: boolean = true;

  backdropClass: string | null = null;

  fixedBottom: boolean = false;

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /** Whether the attached menu is open. */
  isOpen() {
    return !!this.menuStack.overlayRef?.hasAttached();
  }

  /** Registers a child menu as having been opened by this trigger. */
  registerChildMenu(child: SlideMenuOverlay) {
    this.childMenu = child;
  }

  /**
   * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
   * content to change dynamically and be reflected in the application.
   */
  protected getMenuContentPortal() {
    const hasMenuContentChanged = this.menuTemplateRef !== this._menuPortal?.templateRef;
    if (this.menuTemplateRef && (!this._menuPortal || hasMenuContentChanged)) {
      this._menuPortal = new TemplatePortal(
        this.menuTemplateRef,
        this.menuStack.primaryViewContainerRef || this.viewContainerRef,
        this.menuData,
        this._getChildMenuInjector(),
      );
    }

    return this._menuPortal;
  }

  /**
   * Whether the given element is inside the scope of this trigger's menu stack.
   * @param element The element to check.
   * @return Whether the element is inside the scope of this trigger's menu stack.
   */
  protected isElementInsideMenuStack(element: Element) {
    for (let el: Element | null = element; el; el = el?.parentElement ?? null) {
      if (el.getAttribute('data-slide-menu-stack-id') === this.menuStack.id) {
        return true;
      }
    }
    return false;
  }

  /** Gets the injector to use when creating a child menu. */
  private _getChildMenuInjector() {
    this._childMenuInjector =
      this._childMenuInjector ||
      Injector.create({
        providers: [
          { provide: SLIDE_MENU_TRIGGER, useValue: this },
          { provide: SLIDE_MENU_STACK, useValue: this.menuStack },
        ],
        parent: this.menuStack.primaryInjector || this.injector,
      });
    return this._childMenuInjector;
  }
}
