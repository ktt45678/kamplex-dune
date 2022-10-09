import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

import { HomeHeaderComponent } from './home-header.component';
import { CommonDirectiveModule } from '../../directives/common-directive';
import { PermissionPipeModule } from '../../pipes/permission-pipe';
import { NumberPipeModule } from '../../pipes/number-pipe';
import { DateTimePipeModule } from '../../pipes/date-time-pipe';

@NgModule({
  declarations: [HomeHeaderComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslocoModule,
    LazyLoadImageModule,
    CommonDirectiveModule,
    PermissionPipeModule,
    NumberPipeModule,
    DateTimePipeModule,
    AutoCompleteModule,
    ButtonModule,
    MenuModule
  ],
  exports: [HomeHeaderComponent]
})
export class HomeHeaderModule { }
