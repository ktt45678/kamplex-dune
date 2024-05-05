import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { TranslocoModule } from '@ngneat/transloco';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

import { SearchOverlayComponent } from './search-overlay.component';
import { FormDirectiveModule } from '../../directives/form-directive';
import { DateTimePipeModule } from '../../pipes/date-time-pipe';
import { PlaceholderPipeModule } from '../../pipes/placeholder-pipe';

@NgModule({
  declarations: [SearchOverlayComponent],
  imports: [
    CommonModule,
    RouterModule,
    LazyLoadImageModule,
    TranslocoModule,
    DateTimePipeModule,
    FormDirectiveModule,
    PlaceholderPipeModule,
    DynamicDialogModule,
    InputTextModule
  ],
  exports: [SearchOverlayComponent]
})
export class SearchOverlayModule { }
