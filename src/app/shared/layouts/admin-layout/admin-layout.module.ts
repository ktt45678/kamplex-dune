import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { TabMenuModule } from 'primeng/tabmenu';

import { AdminLayoutComponent } from './admin-layout.component';

@NgModule({
  declarations: [AdminLayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    TabMenuModule,
    MenuModule,
  ],
  exports: [AdminLayoutComponent]
})
export class AdminLayoutModule { }
