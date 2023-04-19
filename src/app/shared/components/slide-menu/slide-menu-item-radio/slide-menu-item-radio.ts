/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Directive, inject, OnDestroy } from '@angular/core';

import { SlideMenuItemSelectable } from '../slide-menu-item-selectable/slide-menu-item-selectable';
import { SlideMenuItem } from '../slide-menu-item/slide-menu-item';

/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;

/**
 * A directive providing behavior for the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
 * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
 */

@Directive({
  selector: '[slideMenuItemRadio]',
  exportAs: 'slideMenuItemRadio',
  host: {
    'role': 'menuitemradio',
    '[class.slide-menu-radio]': 'true',
    '[class.slide-menu-radio-checked]': '!!checked'
  },
  providers: [
    { provide: SlideMenuItemSelectable, useExisting: SlideMenuItemRadio },
    { provide: SlideMenuItem, useExisting: SlideMenuItemSelectable },
  ]
})
export class SlideMenuItemRadio extends SlideMenuItemSelectable implements OnDestroy {
  /** The unique selection dispatcher for this radio's `CdkMenuGroup`. */
  private readonly _selectionDispatcher = inject(UniqueSelectionDispatcher);

  /** An ID to identify this radio item to the `UniqueSelectionDispatcher`. */
  private _id = `${nextId++}`;

  /** Function to unregister the selection dispatcher */
  private _removeDispatcherListener!: () => void;

  constructor() {
    super();
    this._registerDispatcherListener();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();

    this._removeDispatcherListener();
  }

  /**
   * Toggles the checked state of the radio-button.
   * @param options Options the configure how the item is triggered
   *   - keepOpen: specifies that the menu should be kept open after triggering the item.
   */
  override trigger(options?: { keepOpen: boolean }) {
    super.trigger(options);

    if (!this.disabled) {
      this._selectionDispatcher.notify(this._id, '');
    }
  }

  /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
  private _registerDispatcherListener() {
    this._removeDispatcherListener = this._selectionDispatcher.listen((id: string) => {
      this.checked = this._id === id;
    });
  }
}
