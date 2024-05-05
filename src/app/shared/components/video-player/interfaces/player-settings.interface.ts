import { NgStyle } from '@angular/common';
import { MediaPlayerElement } from 'vidstack/elements';
import { Subject, Subscription } from 'rxjs';

import type { KPSubtitleTrack } from './subtitle-track.interface';
import type { ThumbnailFrame } from './thumbnail-frame.interface';

export interface PlayerSettings {
  readonly playbackSpeeds: number[];
  subtitleTracks: KPSubtitleTrack[];
  sourceBaseUrl: string;
  previewThumbnail: string | null;
  thumbnailFrames: ThumbnailFrame[];
  activeThumbPlaceholder: string | null;
  activeQualityValue: number;
  activeSpeedValue: number;
  activeTrackValue: string | null;
  activeAudioLang: string | null;
  activeAudioCodec: number | null;
  activeVolume: number;
  isMuted: boolean;
  isSurroundAudio: boolean;
  autoNext: boolean;
  showSubtitle: boolean;
  showFastForward: boolean;
  fastForwardToastTimeout: number | null;
  rewindToastTimeout: number | null;
  touchControlsTimeout: number | null;
  touchControlsTimeoutValue: number;
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
  playToastAnimEndSub: Subscription | null;
  updateSettingsSub: Subscription | null;
  playerDestroyed: Subject<void>;
  storeDisposeFn: ReturnType<typeof MediaPlayerElement.prototype.subscribe>[];
}
