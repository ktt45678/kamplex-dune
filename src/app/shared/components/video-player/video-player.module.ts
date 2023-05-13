import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { VideoPlayerComponent } from './video-player.component';
import { SlideMenuModule } from '../../components/slide-menu';

@NgModule({
  declarations: [VideoPlayerComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslocoModule,
    SlideMenuModule,
    InputSwitchModule,
    ProgressSpinnerModule
  ],
  exports: [VideoPlayerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VideoPlayerModule { }
