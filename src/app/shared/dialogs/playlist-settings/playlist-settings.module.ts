import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlaylistSettingsComponent } from './playlist-settings.component';

@NgModule({
  declarations: [PlaylistSettingsComponent],
  imports: [
    CommonModule
  ],
  exports: [PlaylistSettingsComponent]
})
export class PlaylistSettingsModule { }
