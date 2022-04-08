import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';

import { VerticalTabComponent } from './vertical-tab.component';
import { TabPanelComponent } from './tab-panel.component';

@NgModule({
  declarations: [
    VerticalTabComponent,
    TabPanelComponent
  ],
  imports: [
    CommonModule,
    MenuModule
  ],
  exports: [
    VerticalTabComponent,
    TabPanelComponent
  ]
})
export class VerticalTabModule { }
