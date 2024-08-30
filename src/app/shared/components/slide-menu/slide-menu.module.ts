import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlideMenuTriggerDirective } from './slide-menu-trigger/slide-menu-trigger';
import { SlideMenuOverlay } from './slide-menu-overlay/slide-menu-overlay';
import { SlideMenuItem } from './slide-menu-item/slide-menu-item';
import { SlideMenuItemCheckbox } from './slide-menu-item-checkbox/slide-menu-item-checkbox';
import { SlideMenuItemRadio } from './slide-menu-item-radio/slide-menu-item-radio';
import { SlideMenuItemButton } from './slide-menu-item-button/slide-menu-item-button';

@NgModule({
  declarations: [
    SlideMenuTriggerDirective,
    SlideMenuOverlay,
    SlideMenuItem,
    SlideMenuItemCheckbox,
    SlideMenuItemRadio,
    SlideMenuItemButton
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SlideMenuTriggerDirective,
    SlideMenuOverlay,
    SlideMenuItem,
    SlideMenuItemCheckbox,
    SlideMenuItemRadio,
    SlideMenuItemButton
  ]
})
export class SlideMenuModule { }
