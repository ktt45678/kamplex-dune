import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { VideoPlayerComponent } from './video-player.component';

@NgModule({
  declarations: [VideoPlayerComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [VideoPlayerComponent]
})
export class VideoPlayerModule { }
