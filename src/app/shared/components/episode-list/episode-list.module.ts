import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ButtonModule } from 'primeng/button';

import { EpisodeListComponent } from './episode-list.component';
import { SkeletonModule } from '../skeleton';
import { DateTimePipeModule } from '../../pipes/date-time-pipe';
import { NumberPipeModule } from '../../pipes/number-pipe';
import { PlaceholderPipeModule } from '../../pipes/placeholder-pipe';

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
    DateTimePipeModule,
    PlaceholderPipeModule,
    NumberPipeModule
  ],
  exports: [
    EpisodeListComponent
  ]
})
export class EpisodeListModule { }
