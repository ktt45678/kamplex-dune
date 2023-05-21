import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutModule } from '@angular/cdk/layout';
import { TranslocoModule } from '@ngneat/transloco';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { VideoPlayerComponent } from './video-player.component';
import { SlideMenuModule } from '../../components/slide-menu';
import { SkeletonModule } from '../skeleton';
import { StringPipeModule } from "../../pipes/string-pipe";

@NgModule({
  declarations: [VideoPlayerComponent],
  exports: [VideoPlayerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LayoutModule,
    TranslocoModule,
    SkeletonModule,
    SlideMenuModule,
    StringPipeModule,
    InputSwitchModule,
    ProgressSpinnerModule
  ]
})
export class VideoPlayerModule { }
