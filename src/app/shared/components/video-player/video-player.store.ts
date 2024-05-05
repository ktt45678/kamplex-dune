import { Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { BreakpointObserver } from '@angular/cdk/layout';
import { signalState } from '@ngrx/signals';
import { Subject } from 'rxjs';

import { PlayerSettings, PlayerStore, PlayerSupports, ThumbnailStore } from './interfaces';
import { MediaBreakpoints } from '../../../core/enums';

@Injectable()
export class VideoPlayerStore {
  readonly settingsState = signalState<PlayerSettings>(this.initPlayerSettings());
  readonly storeState = signalState<PlayerStore>(this.initPlayerStore());
  readonly supportsState = signalState<PlayerSupports>(this.initPlayerSupports());
  readonly thumbnailStoreState = signalState<ThumbnailStore>(this.initThumbnailStore());

  constructor(private platform: Platform, private breakpointObserver: BreakpointObserver) { }

  initPlayerSettings(): PlayerSettings {
    return {
      playbackSpeeds: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      subtitleTracks: [],
      sourceBaseUrl: '',
      previewThumbnail: null,
      thumbnailFrames: [],
      activeThumbPlaceholder: null,
      activeQualityValue: 0,
      activeSpeedValue: 1,
      activeTrackValue: null,
      activeAudioLang: null,
      activeAudioCodec: null,
      initAudioValue: null,
      initAudioSurround: true,
      autoNext: false,
      showSubtitle: false,
      showFastForward: false,
      fastForwardToastTimeout: null,
      rewindToastTimeout: null,
      touchControlsTimeout: null,
      showRewind: false,
      fullWindow: false,
      fillScreen: false,
      initPlaytime: 0,
      activeVolume: 1,
      isMuted: false,
      isSurroundAudio: false,
      expandVolumeSlider: false,
      isMenuOpen: false,
      hasError: false,
      subtitleStyles: null,
      playToastAnimEndSub: null,
      updateSettingsSub: null,
      playerDestroyed: new Subject(),
      storeDisposeFn: [],
      touchControlsTimeoutValue: 2500
    };
  }

  initPlayerStore(): PlayerStore {
    return {
      autoPlayError: null,
      audioTracks: [],
      audioTrack: null,
      textTrack: null,
      canFullscreen: false,
      canPlay: false,
      currentTime: 0,
      error: null,
      fullscreen: false,
      loop: false,
      muted: false,
      paused: true,
      playing: false,
      qualities: [],
      quality: null,
      autoQuality: false,
      canSetQuality: true,
      volume: 1,
      waiting: false
    }
  }

  initPlayerSupports(): PlayerSupports {
    const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    const isMinMobileScreen = this.breakpointObserver.isMatched(MediaBreakpoints.SMALL);
    return {
      isMobile: this.platform.ANDROID || this.platform.IOS || (isTouchDevice && isMinMobileScreen),
      isSafari: this.platform.SAFARI,
      isTouchDevice: isTouchDevice,
      hlsOpus: !this.platform.SAFARI
    };
  }

  initThumbnailStore(): ThumbnailStore {
    return {
      activeThumbnail: null,
      loading: false
    }
  }
}
