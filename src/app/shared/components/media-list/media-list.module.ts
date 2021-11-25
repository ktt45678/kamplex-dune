import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SkeletonModule } from 'primeng/skeleton';

import { MediaListComponent } from './media-list.component';

@NgModule({
  declarations: [MediaListComponent],
  imports: [
    CommonModule,
    RouterModule,
    LazyLoadImageModule,
    SkeletonModule
  ],
  exports: [MediaListComponent]
})
export class MediaListModule { }
