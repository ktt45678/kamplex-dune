import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';

import { VerticalTabComponent } from './vertical-tab.component';
//import { TabPanelComponent } from './tab-panel.component';
import { TabPanelDirective } from './tab-panel.directive';
import { PanelToastDirective } from './panel-toast.directive';
import { TemplatePipeModule } from '../../pipes/template-pipe';

@NgModule({
  declarations: [
    VerticalTabComponent,
    //TabPanelComponent,
    TabPanelDirective,
    PanelToastDirective
  ],
  imports: [
    CommonModule,
    MenuModule,
    TemplatePipeModule
  ],
  exports: [
    VerticalTabComponent,
    //TabPanelComponent,
    TabPanelDirective,
    PanelToastDirective
  ]
})
export class VerticalTabModule { }
