import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { TranslocoModule } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

import { MediaListComponent } from './media-list.component';
import { SkeletonModule } from '../skeleton';
import { LazyloadImageExtraModule } from '../../directives/lazyload-image-extra';
import { CdkMenuCustomModule } from '../../directives/cdk-menu-custom';
import { OverlayPanelModule } from '../../directives/overlay-panel';
import { NumberPipeModule } from '../../pipes/number-pipe';
import { DateTimePipeModule } from '../../pipes/date-time-pipe';

@NgModule({
  declarations: [MediaListComponent],
  imports: [
    CommonModule,
    RouterModule,
    LazyLoadImageModule,
    SkeletonModule,
    LazyloadImageExtraModule,
    TranslocoModule,
    NumberPipeModule,
    DateTimePipeModule,
    CdkMenuCustomModule,
    OverlayPanelModule,
    ButtonModule,
    TagModule,
    DynamicDialogModule
  ],
  exports: [MediaListComponent]
})
export class MediaListModule { }
