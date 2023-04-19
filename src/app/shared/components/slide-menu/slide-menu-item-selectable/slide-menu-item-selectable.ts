// https://github.com/angular/components/blob/main/src/cdk/menu/menu-item-selectable.ts
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, Input } from '@angular/core';

import { SlideMenuItem } from '../slide-menu-item/slide-menu-item';

@Directive({
  host: {
    '[attr.aria-checked]': '!!checked',
    '[attr.aria-disabled]': 'disabled || null',
  }
})
export abstract class SlideMenuItemSelectable extends SlideMenuItem {
  /** Whether the element is checked */
  @Input('menuItemChecked')
  get checked(): boolean {
    return this._checked;
  }
  set checked(value: BooleanInput) {
    this._checked = coerceBooleanProperty(value);
  }
  private _checked = false;

  /** Whether the item should close the menu if triggered by the spacebar. */
  protected override closeOnSpacebarTrigger = false;
}
