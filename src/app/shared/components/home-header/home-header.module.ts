import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

import { HomeHeaderComponent } from './home-header.component';
import { CommonDirectiveModule } from '../../directives/common-directive';
import { PermissionPipeModule } from '../../pipes/permission-pipe';

@NgModule({
  declarations: [HomeHeaderComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslocoModule,
    CommonDirectiveModule,
    PermissionPipeModule,
    ButtonModule,
    MenuModule
  ],
  exports: [HomeHeaderComponent]
})
export class HomeHeaderModule { }
