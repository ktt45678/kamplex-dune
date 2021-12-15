import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SkeletonModule } from 'primeng/skeleton';

import { NumberPipeModule } from '../../pipes/number-pipe';
import { MediaListComponent } from './media-list.component';

@NgModule({
  declarations: [MediaListComponent],
  imports: [
    CommonModule,
    RouterModule,
    LazyLoadImageModule,
    SkeletonModule,
    NumberPipeModule
  ],
  exports: [MediaListComponent]
})
export class MediaListModule { }
