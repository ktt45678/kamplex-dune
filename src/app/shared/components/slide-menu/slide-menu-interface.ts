// https://github.com/angular/components/blob/main/src/cdk/menu/menu-interface.ts
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
import { FocusOrigin } from '@angular/cdk/a11y';

import { SlideMenuStackItem } from './slide-menu-stack/slide-menu-stack';
import { SlideMenuOverlay } from './slide-menu-overlay/slide-menu-overlay';

/** Injection token used to return classes implementing the Menu interface */
export const SLIDE_MENU = new InjectionToken<SlideMenu & SlideMenuOverlay>('slide-menu');

/** Interface which specifies Menu operations and used to break circular dependency issues */
export interface SlideMenu extends SlideMenuStackItem {
  /** The id of the menu's host element. */
  id: string;

  /** The menu's native DOM host element. */
  nativeElement: HTMLElement;

  /** The direction items in the menu flow. */
  readonly orientation: 'horizontal' | 'vertical';

  /** Place focus on the first MenuItem in the menu. */
  focusFirstItem(focusOrigin: FocusOrigin): void;

  /** Place focus on the last MenuItem in the menu. */
  focusLastItem(focusOrigin: FocusOrigin): void;
}
