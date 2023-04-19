/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Directive } from '@angular/core';
import { SlideMenuItemSelectable } from '../slide-menu-item-selectable/slide-menu-item-selectable';
import { SlideMenuItem } from '../slide-menu-item/slide-menu-item';

@Directive({
  selector: '[slideMenuItemCheckbox]',
  exportAs: 'slideMenuItemCheckbox',
  host: {
    'role': 'menuitemcheckbox',
    '[class.slide-menu-checkbox]': 'true',
    '[class.slide-menu-checkbox-checked]': '!!checked'
  },
  providers: [
    { provide: SlideMenuItemSelectable, useExisting: SlideMenuItemCheckbox },
    { provide: SlideMenuItem, useExisting: SlideMenuItemSelectable }
  ]
})
export class SlideMenuItemCheckbox extends SlideMenuItemSelectable {
  /**
   * Toggle the checked state of the checkbox.
   * @param options Options the configure how the item is triggered
   *   - keepOpen: specifies that the menu should be kept open after triggering the item.
   */
  override trigger(options?: { keepOpen: boolean }) {
    super.trigger(options);

    if (!this.disabled) {
      this.checked = !this.checked;
    }
  }

  protected override keepOpen = true;
}
