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
import { PlayIconComponent } from './icons/play-icon/play-icon.component';
import { MuteIconComponent } from './icons/mute-icon/mute-icon.component';
import { FitWindowIconComponent } from './icons/fit-window-icon/fit-window-icon.component';
import { FullscreenIconComponent } from './icons/fullscreen-icon/fullscreen-icon.component';
import { SkipNextIconComponent } from './icons/skip-next-icon/skip-next-icon.component';
import { SkipPreviousIconComponent } from './icons/skip-previous-icon/skip-previous-icon.component';
import { SubtitleIconComponent } from './icons/subtitle-icon/subtitle-icon.component';
import { SettingsIconComponent } from './icons/settings-icon/settings-icon.component';
import { FillIconComponent } from './icons/fill-icon/fill-icon.component';
import { PlayCircleIconComponent } from './icons/play-circle-icon/play-circle-icon.component';

@NgModule({
  declarations: [
    VideoPlayerComponent,
    PlayIconComponent,
    MuteIconComponent,
    FitWindowIconComponent,
    FullscreenIconComponent,
    SkipNextIconComponent,
    SkipPreviousIconComponent,
    SubtitleIconComponent,
    SettingsIconComponent,
    FillIconComponent,
    PlayCircleIconComponent
  ],
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
