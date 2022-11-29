import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { MenuModule } from 'primeng/menu';
import { TabMenuModule } from 'primeng/tabmenu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';

import { AdminLayoutComponent } from './admin-layout.component';
import { CircularProgressModule } from '../../components/circular-progress';
import { DateTimePipeModule } from '../../pipes/date-time-pipe';
import { CommonDirectiveModule } from '../../directives/common-directive';

@NgModule({
  declarations: [AdminLayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslocoModule,
    DateTimePipeModule,
    CommonDirectiveModule,
    TabMenuModule,
    MenuModule,
    OverlayPanelModule,
    PanelModule,
    ButtonModule,
    CircularProgressModule
  ],
  exports: [AdminLayoutComponent]
})
export class AdminLayoutModule { }
