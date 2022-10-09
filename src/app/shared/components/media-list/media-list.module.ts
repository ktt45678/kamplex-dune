import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SkeletonModule } from 'primeng/skeleton';
import { TranslocoModule } from '@ngneat/transloco';

import { LazyloadImageExtraModule } from '../../directives/lazyload-image-extra';
import { NumberPipeModule } from '../../pipes/number-pipe';
import { DateTimePipeModule } from '../../pipes/date-time-pipe';
import { MediaListComponent } from './media-list.component';

@NgModule({
  declarations: [MediaListComponent],
  imports: [
    CommonModule,
    RouterModule,
    LazyLoadImageModule,
    SkeletonModule,
    LazyloadImageExtraModule,
    NumberPipeModule,
    DateTimePipeModule,
    TranslocoModule
  ],
  exports: [MediaListComponent]
})
export class MediaListModule { }
