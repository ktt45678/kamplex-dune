import { NgStyle } from '@angular/common';
import { Dispose } from 'maverick.js';
import { Subject, Subscription } from 'rxjs';

import { KPTrack } from './track.interface';

export interface PlayerSettings {
  readonly playbackSpeeds: number[];
  tracks: KPTrack[];
  sourceBaseUrl: string;
  previewThumbnail: string | null;
  activeQualityValue: number;
  activeSpeedValue: number;
  activeTrackValue: string | null;
  activeAudioLang: string | null;
  activeVolume: number;
  isMuted: boolean;
  autoNext: boolean;
  showSubtitle: boolean;
  showFastForward: boolean;
  fastForwardToastTimeout?: number;
  rewindToastTimeout?: number;
  touchIdleTimeout?: number;
  touchIdleTimeoutValue: number;
  showRewind: boolean;
  fullWindow: boolean;
  fillScreen: boolean;
  initAudioValue: number | null;
  initAudioSurround: boolean | null;
  initPlaytime: number;
  expandVolumeSlider: boolean;
  isMenuOpen: boolean;
  hasError: boolean;
  subtitleStyles: NgStyle['ngStyle'];
  playToastAnimEndSub?: Subscription;
  updateSettingsSub?: Subscription;
  playerDestroyed: Subject<void>;
  storeDisposeFn: Dispose[];
}
