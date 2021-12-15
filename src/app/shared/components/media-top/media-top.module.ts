import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SkeletonModule } from 'primeng/skeleton';

import { NumberPipeModule } from '../../pipes/number-pipe';
import { MediaTopComponent } from './media-top.component';

@NgModule({
  declarations: [MediaTopComponent],
  imports: [
    CommonModule,
    RouterModule,
    LazyLoadImageModule,
    SkeletonModule,
    NumberPipeModule
  ],
  exports: [MediaTopComponent]
})
export class MediaTopModule { }
