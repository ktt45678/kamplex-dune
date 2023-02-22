import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';

import { MediaTopComponent } from './media-top.component';
import { SkeletonModule } from '../skeleton';
import { LazyloadImageExtraModule } from '../../directives/lazyload-image-extra';
import { NumberPipeModule } from '../../pipes/number-pipe';
import { ArrayPipeModule } from '../../pipes/array-pipe/array-pipe.module';

@NgModule({
  declarations: [MediaTopComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslocoModule,
    LazyLoadImageModule,
    SkeletonModule,
    LazyloadImageExtraModule,
    NumberPipeModule,
    ArrayPipeModule
  ],
  exports: [MediaTopComponent]
})
export class MediaTopModule { }
