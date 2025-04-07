import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
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

  constructor(@Inject(DOCUMENT) private document: Document, private platform: Platform,
    private breakpointObserver: BreakpointObserver) { }

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
      audioGain: 1,
      audioCodecOption: 2,
      audioChannelOption: 2,
      prefAudioLang: false,
      prefAudioLangList: ['default'],
      prefSubtitleLang: false,
      prefSubtitleLangList: ['default'],
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
      audioGain: 1,
      waiting: false
    }
  }

  initPlayerSupports(): PlayerSupports {
    const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    const isMobileScreen = !this.breakpointObserver.isMatched(MediaBreakpoints.SMALL);
    const videoEl = this.document.createElement('video');
    return {
      isMobile: this.platform.ANDROID || this.platform.IOS || (isTouchDevice && isMobileScreen),
      isSafari: this.platform.SAFARI,
      isTouchDevice: isTouchDevice,
      hlsOpus: !this.platform.SAFARI,
      av1: videoEl.canPlayType('video/webm; codecs="av01.0.04M.08"') !== '' || videoEl.canPlayType('video/mp4; codecs="av01.0.04M.08"') !== ''
    };
  }

  initThumbnailStore(): ThumbnailStore {
    return {
      activeThumbnail: null,
      loading: false
    }
  }
}
