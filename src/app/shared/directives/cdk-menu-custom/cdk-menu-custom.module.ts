import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkMenuModule } from '@angular/cdk/menu';

import { MenuDirective } from './menu/menu.directive';
import { MenuItemDirective } from './menu-item/menu-item.directive';
import { MenuTriggerDirective } from './menu-trigger/menu-trigger.directive';

@NgModule({
  declarations: [
    MenuDirective,
    MenuItemDirective,
    MenuTriggerDirective
  ],
  imports: [
    CommonModule,
    CdkMenuModule
  ],
  exports: [
    CdkMenuModule,
    MenuDirective,
    MenuItemDirective,
    MenuTriggerDirective
  ]
})
export class CdkMenuCustomModule { }
