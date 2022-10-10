import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

import { EpisodeListComponent } from './episode-list.component';
import { LazyloadImageExtraModule } from '../../directives/lazyload-image-extra';
import { DateTimePipeModule } from '../../pipes/date-time-pipe';
import { NumberPipeModule } from '../../pipes/number-pipe';

@NgModule({
  declarations: [
    EpisodeListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslocoModule,
    LazyLoadImageModule,
    ButtonModule,
    SkeletonModule,
    LazyloadImageExtraModule,
    DateTimePipeModule,
    NumberPipeModule
  ],
  exports: [
    EpisodeListComponent
  ]
})
export class EpisodeListModule { }
