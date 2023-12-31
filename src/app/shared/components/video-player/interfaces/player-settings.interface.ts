import { NgStyle } from '@angular/common';
import { MediaPlayerElement } from 'vidstack/elements';
import { Subject, Subscription } from 'rxjs';

import type { KPTrack } from './track.interface';
import type { ThumbnailFrame } from './thumbnail-frame.interface';

export interface PlayerSettings {
  readonly playbackSpeeds: number[];
  tracks: KPTrack[];
  sourceBaseUrl: string;
  previewThumbnail: string | null;
  thumbnailFrames: ThumbnailFrame[];
  activeThumbPlaceholder: string | null;
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
  storeDisposeFn: ReturnType<typeof MediaPlayerElement.prototype.subscribe>[];
}
