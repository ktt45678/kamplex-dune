import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, OnDestroy, OnInit, output, Renderer2, signal, untracked, viewChild, ViewEncapsulation } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Platform } from '@angular/cdk/platform';
import { patchState } from '@ngrx/signals';
import type { DeepSignal } from '@ngrx/signals/src/deep-signal';
import { isDASHProvider, isHLSProvider, LibASSTextRenderer } from 'vidstack';
import type { MediaEndedEvent, MediaPauseRequestEvent, MediaPlayRequestEvent, MediaProviderChangeEvent, MediaProviderSetupEvent, MediaSeekRequestEvent, MediaVolumeChangeEvent, PlayerSrc } from 'vidstack';
import { MediaPlayerElement, MediaSliderThumbnailElement } from 'vidstack/elements';
import { TranslocoTranslateFn } from '@ngneat/transloco';
import { buffer, debounceTime, filter, first, fromEvent, merge, Subject, takeUntil } from 'rxjs';
import { MediaPlayer as DashMediaPlayer } from 'dashjs';

import { DestroyService } from '../../../../core/services';
import type { PlayerSettings, PlayerStore, PlayerSupports, ThumbnailStore } from '../interfaces';
import { VideoPlayerService } from '../video-player.service';
import { VideoPlayerStore } from '../video-player.store';
import { SelectOption } from '../../../../core/interfaces/primeng';
import { AudioCodec, MediaBreakpoints, VideoCodec } from '../../../../core/enums';
import { track_Id } from '../../../../core/utils';

import 'vidstack/player';
import 'vidstack/player/ui';

@Component({
  selector: 'app-base-video-player, [appBaseVideoPlayer]',
  templateUrl: './base-video-player.component.html',
  styleUrl: './base-video-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
  encapsulation: ViewEncapsulation.None
})
export class BaseVideoPlayerComponent implements OnInit, OnDestroy {
  track_Id = track_Id;
  VideoCodec = VideoCodec;
  t = input.required<TranslocoTranslateFn>();
  canFitWindow = input<boolean>(false);
  canReqNext = input<boolean>(false);
  canReqPrev = input<boolean>(false);
  source = input<PlayerSrc>('');

  playerInit = output<MediaPlayerElement>();
  onEnded = output<void>();
  requestFitWindow = output<boolean>();
  requestNext = output<void>();
  requestPrev = output<void>();

  canNavigateMedia = computed(() => this.canReqPrev() || this.canReqNext());
  player = computed(() => this.playerChild()?.nativeElement || null);
  sliderThumbnailEl = computed(() => this.sliderThumbnailChild()?.nativeElement || null);
  mediaPlayToastEl = computed(() => this.mediaPlayToastChild()?.nativeElement || null);

  playerChild = viewChild<ElementRef<MediaPlayerElement>>('player');
  sliderThumbnailChild = viewChild<ElementRef<MediaSliderThumbnailElement>>('sliderThumbnail');
  mediaPlayToastChild = viewChild<ElementRef<HTMLElement>>('mediaPlayToast');

  playerSettings: DeepSignal<PlayerSettings>;
  playerSupports: DeepSignal<PlayerSupports>;
  playerStore: DeepSignal<PlayerStore>;
  thumbnailStore: DeepSignal<ThumbnailStore>;

  audioGainOptions = [
    { label: '100%', value: 1 },
    { label: '200%', value: 2 }
  ];
  audioCodecOptions = signal<SelectOption[]>([]);
  audioChannelOptions = signal<SelectOption[]>([]);

  private renderer = inject(Renderer2);
  private platform = inject(Platform);
  private breakpointObserver = inject(BreakpointObserver);
  private videoPlayerService = inject(VideoPlayerService);
  private videoPlayerStore = inject(VideoPlayerStore);
  private destroyService = inject(DestroyService);

  constructor() {
    this.playerSettings = this.videoPlayerStore.settingsState;
    this.playerStore = this.videoPlayerStore.storeState;
    this.playerSupports = this.videoPlayerStore.supportsState;
    this.thumbnailStore = this.videoPlayerStore.thumbnailStoreState;
    effect(() => {
      const player = this.player();
      if (!player) return;
      player.src = this.source();
    });
    effect(() => {
      const player = this.player();
      if (!player) return;
      this.onPlayerAttach();
      this.playerInit.emit(player);
    }, { allowSignalWrites: true });
    effect(() => {
      const playToastAnimEndSub = untracked(this.playerSettings.playToastAnimEndSub);
      if (playToastAnimEndSub)
        playToastAnimEndSub.unsubscribe();
      const mediaPlayToastEl = this.mediaPlayToastEl();
      if (!mediaPlayToastEl) return;
      const animEndSub = fromEvent(mediaPlayToastEl, 'animationend').subscribe(() => {
        this.renderer.removeClass(mediaPlayToastEl, 'media-play-toast-active');
      });
      patchState(this.videoPlayerStore.settingsState, { playToastAnimEndSub: animEndSub });
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.breakpointObserver.observe(MediaBreakpoints.LANDSCAPE).pipe(takeUntil(this.destroyService)).subscribe(state => {
      const isMobilePlatform = this.platform.ANDROID || this.platform.IOS;
      const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
      patchState(this.videoPlayerStore.supportsState, { isMobile: (state.matches && isTouchDevice) || isMobilePlatform });
    });
    this.audioCodecOptions.set([
      { label: this.t()('player.audioCodecOptions.off'), value: 1 },
      { label: this.t()('player.audioCodecOptions.auto'), value: 2 },
      { label: this.t()('player.audioCodecOptions.aac'), value: 3 },
      { label: this.t()('player.audioCodecOptions.opus'), value: 4 }
    ]);
    this.audioChannelOptions.set([
      { label: this.t()('player.audioChannelOptions.off'), value: 1 },
      { label: this.t()('player.audioChannelOptions.auto'), value: 2 },
      { label: this.t()('player.audioChannelOptions.stereo'), value: 3 },
      { label: this.t()('player.audioChannelOptions.surround'), value: 4 }
    ]);
  }

  private onPlayerAttach() {
    const player = this.player()!;
    player.keyShortcuts = {
      togglePaused: 'k Space',
      toggleMuted: 'm',
      toggleFullscreen: 'f',
      togglePictureInPicture: 'i',
      toggleCaptions: 'c',
      seekBackward: 'ArrowLeft',
      seekForward: 'ArrowRight',
      volumeUp: 'ArrowUp',
      volumeDown: 'ArrowDown',
    };
    // Set libass renderer
    const renderer = new LibASSTextRenderer(() => import('jassub') as any, {
      workerUrl: '../../../../../assets/js/jassub/jassub-worker.js',
      legacyWasmUrl: '../../../../../assets/js/jassub/jassub-worker-legacy.js',
      modernWasmUrl: '../../../../../assets/js/jassub/jassub-worker-modern.wasm',
      offscreenRender: this.playerSupports.isMobile() ? false : true
    }, {
      onSubtitleReady: (instance => {
        instance.getStyles((error, event) => {
          if (error) return;
          const styleList = Array.isArray(event) ? event : [event];
          this.videoPlayerService.findSubtitleFontList(styleList).subscribe(fontUrls => {
            fontUrls.forEach(fontUrl => {
              instance.addFont(fontUrl);
            });
          });
        });
      })
    });
    player.textRenderers.add(renderer);
    // Set dash.js provider
    fromEvent<MediaProviderChangeEvent>(player, 'provider-change')
      .pipe(takeUntil(this.playerSettings.playerDestroyed())).subscribe((event) => {
        const provider = event.detail;
        if (isDASHProvider(provider)) {
          provider.library = DashMediaPlayer;
          provider.config = {
            streaming: {
              abr: { autoSwitchBitrate: { audio: false } },
              trackSwitchMode: { video: 'alwaysReplace', audio: 'alwaysReplace' },
              buffer: {
                resetSourceBuffersForTrackSwitch: true
              }
            }
          };
        }
      });
    // Update user volume setting when user changes the volume
    fromEvent<MediaVolumeChangeEvent>(player, 'volume-change')
      .pipe(debounceTime(1000), takeUntil(this.playerSettings.playerDestroyed())).subscribe(event => {
        // Set player settings
        patchState(this.videoPlayerStore.settingsState, {
          activeVolume: event.detail.volume,
          isMuted: event.detail.muted
        });
      });
    // Show play or pause icon toast when user plays/pauses the video
    merge(
      fromEvent<MediaPlayRequestEvent>(player, 'media-play-request'),
      fromEvent<MediaPauseRequestEvent>(player, 'media-pause-request')
    ).pipe(takeUntil(this.playerSettings.playerDestroyed())).subscribe(event => {
      if (!event.isOriginTrusted || !this.mediaPlayToastEl()) return;
      this.renderer.addClass(this.mediaPlayToastEl(), 'media-play-toast-active');
    });
    fromEvent<MediaSeekRequestEvent>(player, 'media-seek-request')
      .pipe(
        filter(event => event.trigger instanceof PointerEvent || event.originEvent instanceof KeyboardEvent),
        takeUntil(this.playerSettings.playerDestroyed())
      ).subscribe(event => {
        this.handleUserSeekGesture(event);
      });
    fromEvent<MediaEndedEvent>(player, 'ended')
      .pipe(takeUntil(this.playerSettings.playerDestroyed()))
      .subscribe(event => {
        this.onEnded.emit();
        if (this.playerSettings.autoNext() && this.canReqNext())
          this.requestNext.emit();
      });
    if (this.playerSupports.isTouchDevice()) {
      fromEvent<MediaProviderSetupEvent>(player, 'provider-setup')
        .pipe(takeUntil(this.playerSettings.playerDestroyed())).subscribe(() => {
          this.handleTouchUserControls();
        });
    }
    // Subscribe to the media store
    const storeDisposeFn = this.subscribeMediaStore();
    patchState(this.videoPlayerStore.settingsState, (state) => ({ storeDisposeFn: [...state.storeDisposeFn, ...storeDisposeFn] }));
    // Listen to player destroy event
    fromEvent(player, 'destroy').pipe(first()).subscribe(() => {
      this.playerSettings.playerDestroyed().next();
      this.playerSettings.playerDestroyed().complete();
      this.playerSettings.storeDisposeFn().forEach(fn => {
        fn();
      });
      patchState(this.videoPlayerStore.settingsState, {
        playerDestroyed: new Subject(),
        storeDisposeFn: []
      });
    });
  }

  subscribeMediaStore() {
    const player = this.player()!;
    const setPlayerStoreProp = (props: Partial<PlayerStore>) => {
      patchState(this.videoPlayerStore.storeState, props);
    };
    const storeDisposeFn = [];
    storeDisposeFn.push(
      player.subscribe(({ autoPlayError }) => { setPlayerStoreProp({ autoPlayError }); }),
      player.subscribe(({ canPlay }) => { setPlayerStoreProp({ canPlay }); }),
      player.subscribe(({ waiting }) => { setPlayerStoreProp({ waiting }); }),
      player.subscribe(({ playing }) => { setPlayerStoreProp({ playing }); }),
      player.subscribe(({ paused }) => { setPlayerStoreProp({ paused }); }),
      player.subscribe(({ muted }) => { setPlayerStoreProp({ muted }); }),
      player.subscribe(({ volume }) => { setPlayerStoreProp({ volume }); }),
      player.subscribe(({ audioGain }) => { setPlayerStoreProp({ audioGain }); }),
      player.subscribe(({ fullscreen }) => { setPlayerStoreProp({ fullscreen }); }),
      player.subscribe(({ canFullscreen }) => { setPlayerStoreProp({ canFullscreen }); }),
      player.subscribe(({ currentTime }) => { setPlayerStoreProp({ currentTime }); }),
      player.subscribe(({ quality }) => { setPlayerStoreProp({ quality }); }),
      player.subscribe(({ autoQuality }) => { setPlayerStoreProp({ autoQuality }); }),
      player.subscribe(({ canSetQuality }) => { setPlayerStoreProp({ canSetQuality }); }),
      player.subscribe(({ audioTracks }) => { setPlayerStoreProp({ audioTracks }); }),
      player.subscribe(({ audioTrack }) => { setPlayerStoreProp({ audioTrack }); }),
      player.subscribe(({ textTrack }) => { setPlayerStoreProp({ textTrack }); }),
      player.subscribe(({ error }) => { setPlayerStoreProp({ error }); }),
      player.subscribe(({ loop }) => { setPlayerStoreProp({ loop }); }),
      player.subscribe(({ qualities }) => {
        const sortedQualities = [...qualities].reverse();
        setPlayerStoreProp({ qualities: sortedQualities });
      })
    );
    return storeDisposeFn;
  }

  private handleUserSeekGesture(event: MediaSeekRequestEvent): void {
    const fastForwardToastTimeout = this.playerSettings.fastForwardToastTimeout();
    if (fastForwardToastTimeout) {
      window.clearTimeout(fastForwardToastTimeout);
      patchState(this.videoPlayerStore.settingsState, { fastForwardToastTimeout: null });
    }
    const rewindToastTimeout = this.playerSettings.rewindToastTimeout();
    if (rewindToastTimeout) {
      window.clearTimeout(rewindToastTimeout);
      patchState(this.videoPlayerStore.settingsState, { rewindToastTimeout: null });
    }
    const seekTime = event.detail - this.playerStore.currentTime();
    if (seekTime > 0) {
      const newFastForwardToastTimeout = window.setTimeout(() => {
        patchState(this.videoPlayerStore.settingsState, { showFastForward: false });
      }, 800);
      patchState(this.videoPlayerStore.settingsState, {
        showFastForward: true,
        showRewind: false,
        fastForwardToastTimeout: newFastForwardToastTimeout
      });
    }
    else {
      const newRewindToastTimeout = window.setTimeout(() => {
        patchState(this.videoPlayerStore.settingsState, { showRewind: false });
      }, 800);
      patchState(this.videoPlayerStore.settingsState, {
        showRewind: true,
        showFastForward: false,
        rewindToastTimeout: newRewindToastTimeout
      });
    }
  }

  private handleTouchUserControls(): void {
    const player = this.player()!;
    if (!(isDASHProvider(player.provider) || isHLSProvider(player.provider))) return;
    const controlsAttributeName = 'data-touch-controls';
    const click$ = fromEvent<MouseEvent>(player.provider.video, 'click');
    const clearControlsTimeoutFn = () => {
      const touchControlsTimeout = this.playerSettings.touchControlsTimeout();
      if (touchControlsTimeout) {
        window.clearTimeout(touchControlsTimeout);
        patchState(this.videoPlayerStore.settingsState, { touchControlsTimeout: null });
      }
    };
    // Toggle user controls attribute on tap
    click$.pipe(
      buffer(click$.pipe(debounceTime(200))),
      takeUntil(this.playerSettings.playerDestroyed())
    ).subscribe(events => {
      // Only accept single click, ignore seek gestures
      if (events.length > 1) return;
      if (player.hasAttribute(controlsAttributeName)) {
        this.renderer.removeAttribute(player, controlsAttributeName);
        clearControlsTimeoutFn();
      }
      else {
        this.renderer.setAttribute(player, controlsAttributeName, 'true');
        // Set controls after timeout, clear current timeout if exist
        clearControlsTimeoutFn();
        const touchControlsTimeout = window.setTimeout(() => {
          // Do not remove if the player is paused
          if (player.paused) return;
          this.renderer.removeAttribute(player, controlsAttributeName);
        }, this.playerSettings.touchControlsTimeoutValue());
        patchState(this.videoPlayerStore.settingsState, { touchControlsTimeout });
      }
    });
  }

  togglePlay(): void {
    if (!this.playerStore.canPlay()) return;
    if (this.playerStore.playing())
      this.player()!.pause();
    else
      this.player()!.play();
    this.resetTouchControlsTimeout();
  }

  toggleNext(): void {
    this.requestNext.emit();
    this.resetTouchControlsTimeout();
  }

  togglePrev(): void {
    this.requestPrev.emit();
    this.resetTouchControlsTimeout();
  }

  toggleMute(): void {
    if (this.player()!.muted && this.player()!.volume === 0)
      this.player()!.volume = 0.25;
    this.player()!.muted = !this.player()!.muted;
    patchState(this.videoPlayerStore.settingsState, { isMuted: this.player()!.muted });
  }

  toggleFillScreen(): void {
    patchState(this.videoPlayerStore.settingsState, { fillScreen: !this.playerSettings.fillScreen() });
    this.resetTouchControlsTimeout();
  }

  toggleFullwindow(): void {
    patchState(this.videoPlayerStore.settingsState, { fullWindow: !this.playerSettings.fullWindow() });
    this.requestFitWindow.emit(this.playerSettings.fullWindow());
  }

  toggleFullscreen(): void {
    if (this.playerStore.canFullscreen()) {
      if (!this.playerStore.fullscreen())
        this.player()!.enterFullscreen();
      else
        this.player()!.exitFullscreen();
      this.resetTouchControlsTimeout();
    }
  }

  toggleSubtitle(): void {
    const player = this.player()!;
    if (!player.textTracks.length) return;
    if (this.playerSettings.showSubtitle()) {
      // This will also set enableSubtitle to false
      this.setPlayerTrack(null);
    } else if (this.playerSettings.subtitleTracks()) {
      const nextTrack = this.playerSettings.activeTrackValue() ?
        this.playerSettings.subtitleTracks().find(t => t.lang === this.playerSettings.activeTrackValue()) :
        this.playerSettings.subtitleTracks()[0];
      if (nextTrack) {
        player.textTracks.getById(nextTrack._id)!.mode = 'showing';
        patchState(this.videoPlayerStore.settingsState, { activeTrackValue: nextTrack.lang });
      }
      patchState(this.videoPlayerStore.settingsState, { showSubtitle: true });
    }
  }

  toggleVolumeSlider(expand: boolean) {
    patchState(this.videoPlayerStore.settingsState, { expandVolumeSlider: expand });
  }

  toggleMenu(open: boolean) {
    patchState(this.videoPlayerStore.settingsState, { isMenuOpen: open });
  }

  unsetPlayerSource(): void {
    if (!this.player()) return;
    this.player()!.src = '';
  }

  setPlaybackSpeed(speed: number = 1): void {
    if (!this.player()) return;
    this.player()!.playbackRate = speed;
    patchState(this.videoPlayerStore.settingsState, { activeSpeedValue: speed });
  }

  // setAudioGainWithScale(gain: number = 1, scale: number): void {
  //   const gainValue = Math.ceil(gain / scale);
  //   this.setAudioGain(gainValue);
  // }

  setAudioGain(gain: number = 1): void {
    const player = this.player();
    if (!player) return;
    // Since gain = 1 will set audioGain to null, only check same value if > 1
    if ((player.state.audioGain === gain) || (!player.state.audioGain && gain === 1)) return;
    player.setAudioGain(gain);
    patchState(this.videoPlayerStore.settingsState, { audioGain: gain });
  }

  setAudioCodecOption(option: number = 2): void {
    // 1: Off, 2: Auto, 3: AAC, 4: Opus
    patchState(this.videoPlayerStore.settingsState, { audioCodecOption: option });
  }

  setAudioChannelOption(option: number = 2): void {
    // 1: Off, 2: Auto, 3: Stereo, 4: Surround
    patchState(this.videoPlayerStore.settingsState, { audioChannelOption: option });
  }

  changeAudioTrack(index: number): void {
    const player = this.player()!;
    if (!player || player.audioTracks.readonly) return;
    const audioTrack = player.audioTracks[index];
    if (!audioTrack) return;
    audioTrack.selected = true;
    const audioTrackCodec = Number(audioTrack.label.split(' - ')[2]) || 1;
    const isSurroundAudio = [AudioCodec.AAC_SURROUND, AudioCodec.OPUS_SURROUND].includes(audioTrackCodec);
    patchState(this.videoPlayerStore.settingsState, {
      activeAudioLang: audioTrack.language,
      activeAudioCodec: audioTrackCodec,
      isSurroundAudio: isSurroundAudio
    });
  }

  changeVideoQuality(height: number): void {
    const player = this.player()!;
    if (!player || !this.playerStore.canSetQuality()) return;
    // Set selected quality
    if (height === 0) {
      player.qualities.autoSelect();
      patchState(this.videoPlayerStore.settingsState, { activeQualityValue: 0 });
    } else {
      const quality = this.playerStore.qualities().find(q => q.height === height)
      // Fallback to auto if quality not found
      if (!quality)
        return player.qualities.autoSelect();
      quality.selected = true;
      patchState(this.videoPlayerStore.settingsState, { activeQualityValue: quality.height });
    }
  }

  changeVideoQualityById(id: string | null): void {
    const player = this.player()!;
    if (!player || !this.playerStore.canSetQuality()) return;
    if (id === null) {
      player.qualities.autoSelect();
      patchState(this.videoPlayerStore.settingsState, { activeQualityValue: 0 });
    } else {
      const quality = this.playerStore.qualities().find(q => q.id === id)
      // Fallback to auto if quality not found
      if (!quality)
        return player.qualities.autoSelect();
      quality.selected = true;
      patchState(this.videoPlayerStore.settingsState, { activeQualityValue: quality.height });
    }
  }

  setPlayerTrack(lang: string | null): void {
    const player = this.player()!;
    if (!player) return;
    if (this.playerSettings.showSubtitle() && player.textTracks.selected) {
      player.textTracks.selected.mode = 'disabled';
      patchState(this.videoPlayerStore.settingsState, { showSubtitle: false });
    }
    if (lang !== null) {
      const nextTrack = this.playerSettings.subtitleTracks().find(t => t.lang === lang)!;
      player.textTracks.getById(nextTrack._id)!.mode = 'showing';
      patchState(this.videoPlayerStore.settingsState, { activeTrackValue: lang, showSubtitle: true });
    } else {
      patchState(this.videoPlayerStore.settingsState, { showSubtitle: false });
    }
  }

  toggleAutoNext(value: boolean): void {
    patchState(this.videoPlayerStore.settingsState, { autoNext: value });
  }

  seekTime(value: number): void {
    if (!this.player()) return;
    this.player()!.currentTime += value;
  }

  requestNextMedia(): void {
    this.requestNext.emit();
    this.resetTouchControlsTimeout();
  }

  requestPrevMedia(): void {
    this.requestPrev.emit();
    this.resetTouchControlsTimeout();
  }

  resetTouchControlsTimeout(): void {
    if (!this.playerSupports.isTouchDevice()) return;
    const controlsAttributeName = 'data-touch-controls';
    this.renderer.setAttribute(this.player(), controlsAttributeName, 'true');
    const touchControlsTimeout = this.playerSettings.touchControlsTimeout();
    if (touchControlsTimeout)
      window.clearTimeout(touchControlsTimeout);
    const newTouchControlsTimeout = window.setTimeout(() => {
      this.renderer.removeAttribute(this.player(), controlsAttributeName);
    }, this.playerSettings.touchControlsTimeoutValue());
    patchState(this.videoPlayerStore.settingsState, { touchControlsTimeout: newTouchControlsTimeout });
  }

  ngOnDestroy(): void {
    this.playerSettings.playerDestroyed().next();
    this.playerSettings.playerDestroyed().complete();
  }
}
