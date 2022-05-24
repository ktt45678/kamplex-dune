import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { VideoPlayerComponent } from './video-player.component';

@NgModule({
  declarations: [VideoPlayerComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [VideoPlayerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VideoPlayerModule { }
