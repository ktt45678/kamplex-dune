import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, ViewEncapsulation, Renderer2, OnChanges, SimpleChanges } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Platform } from '@angular/cdk/platform';
import { TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { type MediaVolumeChangeEvent, type TextTrackInit, type MediaPlayRequestEvent, type MediaPauseRequestEvent, type MediaSeekRequestEvent, type MediaProviderSetupEvent, type MediaPlayEvent, type HLSAudioTrackLoadedEvent, type MediaLoadStartEvent, isDashProvider, LibASSTextRenderer, type MediaProviderChangeEvent, type AudioTrack, MediaLoadedMetadataEvent } from 'vidstack';
import { MediaPlayerElement, MediaSliderThumbnailElement } from 'vidstack/elements';
import { Subject, buffer, debounceTime, filter, first, firstValueFrom, forkJoin, fromEvent, merge, switchMap, takeUntil, timer } from 'rxjs';
import * as dashjs from 'dashjs';

import type { MediaDetails, MediaStream, UserSettings } from '../../../core/models';
import type { UpdateUserSettingsDto } from '../../../core/dto/users';
import type { KPTrack, PlayerSettings, PlayerStore, PlayerSupports, ThumbnailStore } from './interfaces';
import { AuthService, DestroyService, UsersService } from '../../../core/services';
import { VideoPlayerService } from './video-player.service';
import { AudioCodec, MediaBreakpoints, MediaStorageType, MediaType } from '../../../core/enums';
import { getFontFamily, getTextEdgeStyle, prepareColor, scaleFontWeight, track_Id } from '../../../core/utils';

import 'vidstack/player';
import 'vidstack/player/layouts';
import 'vidstack/player/ui';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    VideoPlayerService,
    DestroyService,
    UsersService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: ['languages', 'media', 'player']
    }
  ],
  host: {
    class: 'tw-block'
  }
})
export class VideoPlayerComponent implements OnInit, OnChanges, OnDestroy {
  track_Id = track_Id;
  AudioCodec = AudioCodec;
  canNavigateMedia: boolean = false;
  @Input() media?: MediaDetails;
  @Input() canFitWindow: boolean = false;
  @Input() canReqNext: boolean = false;
  @Input() canReqPrev: boolean = false;
  @Output() onEnded = new EventEmitter<void>();
  @Output() requestFitWindow = new EventEmitter<boolean>();
  @Output() requestNext = new EventEmitter<void>();
  @Output() requestPrev = new EventEmitter<void>();
  player!: MediaPlayerElement;
  sliderThumbnailEl?: MediaSliderThumbnailElement;
  playerSettings: PlayerSettings;
  playerSupports: PlayerSupports;
  mediaPlayToast?: HTMLElement;
  streamData?: MediaStream;
  playerStore: PlayerStore;
  thumbnailStore: ThumbnailStore;
  userSettings: UserSettings | null = null;
  pendingUpdateSettings: UpdateUserSettingsDto = {};

  @Input('stream') set setStreamData(value: MediaStream | undefined) {
    if (!value) {
      this.unsetPlayerSource();
      return;
    }
    if (this.streamData === value) return;
    this.streamData = value;
    this.setPlayerData(value);
  }

  @Input('initPlaytime') set initPlaytime(value: number) {
    this.playerSettings.initPlaytime = value;
  }

  @ViewChild('player') set setPlayer(value: ElementRef<MediaPlayerElement> | undefined) {
    if (!this.player && value) {
      this.player = value.nativeElement;
      this.onPlayerAttach();
    }
  }

  @ViewChild('sliderThumbnail') set setSliderThumbnail(value: ElementRef<MediaSliderThumbnailElement> | undefined) {
    this.sliderThumbnailEl = value?.nativeElement;
    this.setPlayerPreviewThumbnail();
  }

  @ViewChild('mediaPlayToast') set setMediaPlayToast(value: ElementRef<HTMLElement> | undefined) {
    if (this.playerSettings.playToastAnimEndSub)
      this.playerSettings.playToastAnimEndSub.unsubscribe();
    this.mediaPlayToast = value?.nativeElement;
    if (!this.mediaPlayToast) return;
    this.playerSettings.playToastAnimEndSub = fromEvent(this.mediaPlayToast, 'animationend').subscribe(() => {
      this.renderer.removeClass(this.mediaPlayToast, 'media-play-toast-active');
    });
  }

  constructor(private ref: ChangeDetectorRef, private renderer: Renderer2, private breakpointObserver: BreakpointObserver,
    private platform: Platform, private translocoService: TranslocoService, private authService: AuthService,
    private usersService: UsersService, private videoPlayerService: VideoPlayerService, private destroyService: DestroyService) {
    this.playerSettings = this.videoPlayerService.initPlayerSettings();
    this.playerStore = this.videoPlayerService.initPlayerStore();
    this.thumbnailStore = this.videoPlayerService.initThumbnailStore();
    const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    const isMinMobileScreen = this.breakpointObserver.isMatched(MediaBreakpoints.SMALL);
    this.playerSupports = {
      isMobile: this.platform.ANDROID || this.platform.IOS || (isTouchDevice && isMinMobileScreen),
      isSafari: this.platform.SAFARI,
      isTouchDevice: isTouchDevice,
      hlsOpus: !this.platform.SAFARI
    };
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      this.userSettings = user?.settings || null;
      this.applyUserSettings();
      this.updateSubtitleStyles();
      this.ref.markForCheck();
    });
    this.breakpointObserver.observe(MediaBreakpoints.LANDSCAPE).pipe(takeUntil(this.destroyService)).subscribe(state => {
      const isMobilePlatform = this.platform.ANDROID || this.platform.IOS;
      const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
      this.playerSupports.isMobile = (state.matches && isTouchDevice) || isMobilePlatform;
      this.ref.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['canReqPrevEp'] || changes['canReqNextEp']) {
      this.canNavigateMedia = changes['canReqPrevEp']?.currentValue || changes['canReqNextEp']?.currentValue;
      this.ref.markForCheck();
    }
  }

  //** Run when stream input changed */
  setPlayerData(data: MediaStream): void {
    const tracks: KPTrack[] = [];
    if (data.subtitles?.length) {
      this.translocoService.selectTranslation('languages').pipe(first()).subscribe(t => {
        data.subtitles.sort().forEach(subtitle => {
          const srcSplit = subtitle.src.split('.');
          const trackType = <'vtt' | 'srt' | 'ass' | 'ssa'>(this.videoPlayerService.isGzipSubtitle(subtitle.mimeType) ?
            srcSplit[srcSplit.length - 2] :
            srcSplit[srcSplit.length - 1]);
          tracks.push({
            _id: subtitle._id,
            label: t[subtitle.lang],
            lang: subtitle.lang,
            src: subtitle.src,
            mimeType: subtitle.mimeType,
            type: trackType
          });
        });
        this.playerSettings.tracks = tracks;
        this.setPlayerTrackList();
      });
    }
    this.playerSettings.sourceBaseUrl = data.baseUrl;
    this.playerSettings.previewThumbnail = data.baseUrl.replace(':path', data.previewThumbnail);
    this.setPlayerSource();
    this.setPlayerPreviewThumbnail();
  }

  applyUserSettings(): void {
    if (!this.userSettings) return;
    if (this.userSettings.player.speed != undefined && this.userSettings.player.speed >= 0)
      this.playerSettings.activeSpeedValue = this.userSettings.player.speed / 100;
    if (this.userSettings.player.muted)
      this.playerSettings.isMuted = this.userSettings.player.muted;
    if (this.userSettings.player.audioTrack != undefined)
      this.playerSettings.initAudioValue = this.userSettings.player.audioTrack;
    if (this.userSettings.player.audioSurround != undefined)
      this.playerSettings.initAudioSurround = this.userSettings.player.audioSurround;
    if (this.userSettings.player.quality != undefined)
      this.playerSettings.activeQualityValue = this.userSettings.player.quality;
    if (this.userSettings.player.subtitle != undefined)
      this.playerSettings.showSubtitle = this.userSettings.player.subtitle;
    if (this.userSettings.player.volume != undefined)
      this.playerSettings.activeVolume = this.userSettings.player.volume / 100;
    if (this.userSettings.player.autoNext != undefined)
      this.playerSettings.autoNext = this.userSettings.player.autoNext;
  }

  private onPlayerAttach() {
    if (!this.player.src)
      this.setPlayerSource();
    // Set track list for the player, it's different from the track list in the menu
    this.setPlayerTrackList();
    this.player.keyShortcuts = {
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
      workerUrl: '../../../../assets/js/jassub/jassub-worker.js',
      legacyWasmUrl: '../../../../assets/js/jassub/jassub-worker-legacy.js',
      modernWasmUrl: '../../../../assets/js/jassub/jassub-worker-modern.wasm'
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
    this.player.textRenderers.add(renderer);
    // Set hls.js provider
    fromEvent<MediaProviderChangeEvent>(this.player, 'provider-change')
      .pipe(takeUntil(this.playerSettings.playerDestroyed)).subscribe((event) => {
        const provider = event.detail;
        if (isDashProvider(provider)) {
          provider.library = dashjs as any;
          provider.config = {
            streaming: {
              abr: { autoSwitchBitrate: { audio: false } },
              buffer: { fastSwitchEnabled: true },
              trackSwitchMode: { video: 'alwaysReplace', audio: 'alwaysReplace' }
            }
          };
        }
      });
    // Register media session when the media starts playing
    fromEvent<MediaLoadStartEvent>(this.player, 'load-start')
      .pipe(takeUntil(this.playerSettings.playerDestroyed)).subscribe(() => {
        this.registerMediaSession();
      });
    // Update user volume setting when user changes the volume
    fromEvent<MediaVolumeChangeEvent>(this.player, 'volume-change')
      .pipe(debounceTime(1000), takeUntil(this.playerSettings.playerDestroyed)).subscribe(event => {
        // Set player settings
        this.playerSettings.activeVolume = event.detail.volume;
        this.playerSettings.isMuted = event.detail.muted;
        // Save user settings
        if (!this.userSettings || event.detail.volume * 100 === this.userSettings.player.volume) return;
        this.updateUserSettings({ player: { muted: event.detail.muted, volume: Math.round(event.detail.volume * 100) } });
      });
    // Show play or pause icon toast when user plays/pauses the video
    merge(
      fromEvent<MediaPlayRequestEvent>(this.player, 'media-play-request'),
      fromEvent<MediaPauseRequestEvent>(this.player, 'media-pause-request')
    ).pipe(takeUntil(this.playerSettings.playerDestroyed)).subscribe(event => {
      if (!event.isOriginTrusted || !this.mediaPlayToast) return;
      //this.renderer.removeClass(this.mediaToast, 'media-play-toast-active');
      this.renderer.addClass(this.mediaPlayToast, 'media-play-toast-active');
    });
    fromEvent<MediaSeekRequestEvent>(this.player, 'media-seek-request')
      .pipe(
        filter(event => event.trigger instanceof PointerEvent || event.originEvent instanceof KeyboardEvent),
        takeUntil(this.playerSettings.playerDestroyed)
      ).subscribe(event => {
        this.handleUserSeekGesture(event);
      });
    if (this.playerSupports.isTouchDevice) {
      fromEvent<MediaProviderSetupEvent>(this.player, 'provider-setup')
        .pipe(takeUntil(this.playerSettings.playerDestroyed)).subscribe(() => {
          this.handleTouchUserControls();
        });
    }
    // Set init audio track when track list is available
    fromEvent<HLSAudioTrackLoadedEvent>(this.player, 'hls-audio-track-loaded').pipe(first()).subscribe(() => {
      this.setInitAudioTrack(this.playerSettings.initAudioValue, this.playerSettings.initAudioSurround);
    });
    const setPlayerStoreProp = (props: Partial<PlayerStore>) => {
      Object.assign(this.playerStore, props);
      this.ref.markForCheck();
    };
    // Subscribe to the media store
    this.playerSettings.storeDisposeFn.push(
      this.player.subscribe(({ autoplayError }) => { setPlayerStoreProp({ autoplayError }); }),
      this.player.subscribe(({ canPlay }) => { setPlayerStoreProp({ canPlay }); }),
      this.player.subscribe(({ waiting }) => { setPlayerStoreProp({ waiting }); }),
      this.player.subscribe(({ playing }) => { setPlayerStoreProp({ playing }); }),
      this.player.subscribe(({ paused }) => { setPlayerStoreProp({ paused }); }),
      this.player.subscribe(({ muted }) => { setPlayerStoreProp({ muted }); }),
      this.player.subscribe(({ volume }) => { setPlayerStoreProp({ volume }); }),
      this.player.subscribe(({ fullscreen }) => { setPlayerStoreProp({ fullscreen }); }),
      this.player.subscribe(({ canFullscreen }) => { setPlayerStoreProp({ canFullscreen }); }),
      this.player.subscribe(({ currentTime }) => { setPlayerStoreProp({ currentTime }); }),
      this.player.subscribe(({ quality }) => { setPlayerStoreProp({ quality }); }),
      this.player.subscribe(({ autoQuality }) => { setPlayerStoreProp({ autoQuality }); }),
      this.player.subscribe(({ canSetQuality }) => { setPlayerStoreProp({ canSetQuality }); }),
      this.player.subscribe(({ audioTracks }) => { setPlayerStoreProp({ audioTracks }); }),
      this.player.subscribe(({ audioTrack }) => { setPlayerStoreProp({ audioTrack }); }),
      this.player.subscribe(({ textTrack }) => { setPlayerStoreProp({ textTrack }); }),
      this.player.subscribe(({ error }) => { setPlayerStoreProp({ error }); }),
      this.player.subscribe(({ loop }) => { setPlayerStoreProp({ loop }); }),
      this.player.subscribe(({ qualities }) => {
        const sortedQualities = [...qualities].reverse();
        setPlayerStoreProp({ qualities: sortedQualities });
      }),
      this.player.subscribe(({ ended }) => {
        if (!ended) return;
        this.onEnded.emit();
        if (this.playerSettings.autoNext && this.canReqNext)
          this.requestNext.emit();
      })
    );
    fromEvent(this.player, 'destroy').pipe(first()).subscribe(() => {
      this.playerSettings.playerDestroyed.next();
      this.playerSettings.playerDestroyed.complete();
      this.playerSettings.playerDestroyed = new Subject();
      this.playerSettings.storeDisposeFn.forEach(fn => {
        fn();
      });
    });
  }

  private handleTouchUserControls(): void {
    if (!isDashProvider(this.player.provider)) return;
    const controlsAttributeName = 'data-touch-controls';
    const click$ = fromEvent<MouseEvent>(this.player.provider.video, 'click');
    const clearControlsTimeoutFn = () => {
      if (this.playerSettings.touchControlsTimeout) {
        window.clearTimeout(this.playerSettings.touchControlsTimeout);
        this.playerSettings.touchControlsTimeout = undefined;
      }
    };
    // Toggle user controls attribute on tap
    click$.pipe(
      buffer(click$.pipe(debounceTime(200))),
      takeUntil(this.playerSettings.playerDestroyed)
    ).subscribe(events => {
      // Only accept single click, ignore seek gestures
      if (events.length > 1) return;
      if (this.player.hasAttribute(controlsAttributeName)) {
        this.renderer.removeAttribute(this.player, controlsAttributeName);
        clearControlsTimeoutFn();
      }
      else {
        this.renderer.setAttribute(this.player, controlsAttributeName, 'true');
        // Set controls after timeout, clear current timeout if exist
        clearControlsTimeoutFn();
        this.playerSettings.touchControlsTimeout = window.setTimeout(() => {
          // Do not remove if the player is paused
          if (this.player.paused) return;
          this.renderer.removeAttribute(this.player, controlsAttributeName);
        }, this.playerSettings.touchControlsTimeoutValue);
      }
    });
  }

  private resetTouchControlsTimeout(): void {
    if (!this.playerSupports.isTouchDevice) return;
    const controlsAttributeName = 'data-touch-controls';
    this.renderer.setAttribute(this.player, controlsAttributeName, 'true');
    if (this.playerSettings.touchControlsTimeout)
      window.clearTimeout(this.playerSettings.touchControlsTimeout);
    this.playerSettings.touchControlsTimeout = window.setTimeout(() => {
      this.renderer.removeAttribute(this.player, controlsAttributeName);
    }, this.playerSettings.touchControlsTimeoutValue);
  }

  private handleUserSeekGesture(event: MediaSeekRequestEvent): void {
    if (this.playerSettings.fastForwardToastTimeout) {
      window.clearTimeout(this.playerSettings.fastForwardToastTimeout);
      this.playerSettings.fastForwardToastTimeout = undefined;
    }
    if (this.playerSettings.rewindToastTimeout) {
      window.clearTimeout(this.playerSettings.rewindToastTimeout);
      this.playerSettings.rewindToastTimeout = undefined;
    }
    const seekTime = event.detail - this.playerStore.currentTime;
    if (seekTime > 0) {
      this.playerSettings.showFastForward = true;
      this.playerSettings.showRewind = false;
      this.playerSettings.fastForwardToastTimeout = window.setTimeout(() => {
        this.playerSettings.showFastForward = false;
        this.ref.markForCheck();
      }, 800);
    }
    else {
      this.playerSettings.showRewind = true;
      this.playerSettings.showFastForward = false;
      this.playerSettings.rewindToastTimeout = window.setTimeout(() => {
        this.playerSettings.showRewind = false;
        this.ref.markForCheck();
      }, 800);
    }
    this.ref.markForCheck();
  }

  setPlayerTrackList(): void {
    if (!this.player) return;
    const defaultLanguage = this.playerSettings.activeTrackValue ||
      this.userSettings?.player.subtitleLang ||
      this.translocoService.getActiveLang();
    // Get the previously selected subtitle language
    //const lastSubtitleLanguage = this.player.textTracks.selected?.language;
    // Remove all existing subtitles
    const oldSubtitles = this.player.textTracks.getByKind('subtitles');
    oldSubtitles.forEach(s => {
      this.player.textTracks.remove(s);
    });
    for (let i = 0; i < this.playerSettings.tracks.length; i++) {
      const track = this.playerSettings.tracks[i];
      const textTrack: TextTrackInit = {
        id: track._id,
        label: track.label,
        language: track.lang,
        src: track.src,
        kind: 'subtitles',
        type: track.type,
        mimeType: track.mimeType,
      };
      if (this.videoPlayerService.isGzipSubtitle(track.mimeType)) {
        textTrack.subtitleLoader = (loadTrack) => firstValueFrom(this.videoPlayerService.loadGzipSubtitle(loadTrack.src!));
      }
      if (textTrack.language === defaultLanguage) {
        textTrack.default = true;
        this.playerSettings.activeTrackValue = textTrack.language;
      }
      //   if (lastSubtitleLanguage && track.lang === lastSubtitleLanguage) {
      //     // Select subtitle based on the previously selected language
      //     textTrack.default = true;
      //     this.playerSettings.activeTrackValue = textTrack.language!;
      //     this.playerSettings.showSubtitle = true;
      //   } else if (this.userSettings?.player.subtitle && track.lang === defaultLanguage) {
      //     // Select subtitle based on user settings
      //     textTrack.default = true;
      //     this.playerSettings.activeTrackValue = textTrack.language!;
      //     this.playerSettings.showSubtitle = true;
      //   }
      this.player.textTracks.add(textTrack);
    };
  }

  setPlaybackSpeed(speed: number = 1): void {
    if (!this.player) return;
    this.player.playbackRate = speed;
    this.playerSettings.activeSpeedValue = speed;
    this.updateUserSettings({ player: { speed: speed * 100 } });
  }

  setPlayerSource(): void {
    if (!this.player || !this.streamData?.streams) return;
    const playlist = this.streamData.streams.find(s => s.type === MediaStorageType.MANIFEST);
    if (!playlist) return;
    const playlistSrc = this.playerSettings.sourceBaseUrl.replace(':path', `${playlist._id}/${playlist.name}`);
    if (dashjs.supportsMediaSource()) {
      // Use dash.js when supported
      this.videoPlayerService.generateParsedDash(playlistSrc, this.playerSettings.sourceBaseUrl, { opus: this.playerSupports.hlsOpus })
        .subscribe(manifest => {
          // Set source url
          this.player.src = {
            src: manifest, //https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd, https://files.catbox.moe/57jhls.mpd
            type: 'video/dash',
            provider: 'dash'
          };
        });
    } else {
      // Fallback to native HLS
      this.videoPlayerService.generateM3U8(playlistSrc, this.playerSettings.sourceBaseUrl, { opus: false })
        .subscribe(manifestSrc => {
          this.player.src = { src: manifestSrc, type: 'application/x-mpegurl' };
        });
    }
    // Apply settings to the player when playing
    this.applySourceSettingsOnLoaded();
  }

  setPlayerPreviewThumbnail(): void {
    if (!this.sliderThumbnailEl) return;
    this.playerSettings.storeDisposeFn.push(
      this.sliderThumbnailEl.subscribe(({ activeCue }) => {
        this.thumbnailStore.activeCue = activeCue;
        this.onThumbnailCueChange();
        this.ref.markForCheck();
      }),
      this.sliderThumbnailEl.subscribe(({ loading }) => {
        this.thumbnailStore.loading = loading;
        this.ref.markForCheck();
      })
    );
    if (!this.playerSettings.previewThumbnail) {
      this.sliderThumbnailEl.src = '';
      return;
    }
    this.videoPlayerService.getPreviewThumbnails(this.playerSettings.previewThumbnail).subscribe(thumbnailFrames => {
      if (!thumbnailFrames) {
        this.sliderThumbnailEl!.src = '';
        return;
      }
      this.playerSettings.thumbnailFrames = thumbnailFrames;
      const generatedCues = this.videoPlayerService.createThumbnailCues(thumbnailFrames);
      this.sliderThumbnailEl!.src = {
        src: generatedCues,
        baseURL: this.playerSettings.previewThumbnail!,
        type: 'cues'
      };
    });
  }

  onThumbnailCueChange() {
    this.playerSettings.activeThumbPlaceholder = null;
    if (this.thumbnailStore.activeCue && this.playerSettings.thumbnailFrames.length) {
      const activeFrame = this.playerSettings.thumbnailFrames.find(f => f.startTime === this.thumbnailStore.activeCue!.startTime);
      this.playerSettings.activeThumbPlaceholder = activeFrame ? activeFrame.placeholder : null;
    }
    this.ref.markForCheck();
  }

  applySourceSettingsOnLoaded() {
    fromEvent<MediaLoadedMetadataEvent>(this.player, 'loaded-metadata').pipe(first()).subscribe(() => {
      this.player.muted = this.playerSettings.isMuted;
      this.player.volume = this.playerSettings.activeVolume;
      this.player.playbackRate = this.playerSettings.activeSpeedValue;
      // Set audio track when the source is changed
      if (this.playerSettings.activeAudioLang) {
        this.setAudioTrackByLang(this.playerSettings.activeAudioLang!, this.playerSettings.initAudioValue);
      }
      // Set video quality when the source is changed
      if (this.playerSettings.activeQualityValue > 0) {
        this.changeVideoQuality(this.playerSettings.activeQualityValue);
      }
      // Set subtitle when the source is changed
      if (this.playerSettings.activeTrackValue !== null) {
        this.setPlayerTrack(this.playerSettings.activeTrackValue);
      }
    });
    // Move set time to play event because of some issues with autoplay
    fromEvent<MediaPlayEvent>(this.player, 'play').pipe(first()).subscribe(() => {
      this.player.currentTime = this.playerSettings.initPlaytime;
    });
  }

  unsetPlayerSource(): void {
    if (!this.player) return;
    this.player.src = [];
  }

  changeAudioTrack(index: number): void {
    if (!this.player || this.player.audioTracks.readonly) return;
    const audioTrack = this.player.audioTracks[index];
    if (!audioTrack) return;
    audioTrack.selected = true;
    this.playerSettings.activeAudioLang = audioTrack.language;
    const audioTrackCodec = Number(audioTrack.label.split('-')[1]) || 1;
    const isSurroundAudio = [AudioCodec.AAC_SURROUND, AudioCodec.OPUS_SURROUND].includes(audioTrackCodec);
    this.updateUserSettings({ player: { audioTrack: audioTrackCodec, audioSurround: isSurroundAudio } });
  }

  changeVideoQuality(height: number): void {
    if (!this.player || !this.playerStore.canSetQuality) return;
    // Set selected quality
    if (height === 0) {
      this.player.qualities.autoSelect();
      this.updateUserSettings({ player: { quality: 0 } });
    } else {
      const quality = this.playerStore.qualities.find(q => q.height === height);
      // Fallback to auto if quality not found
      if (!quality)
        return this.player.qualities.autoSelect();
      quality.selected = true;
      this.updateUserSettings({ player: { quality: quality.height } });
    }
  }

  setPlayerTrack(lang: string | null): void {
    if (!this.player) return;
    if (this.playerSettings.showSubtitle && this.player.textTracks.selected) {
      this.player.textTracks.selected.mode = 'disabled';
      this.playerSettings.showSubtitle = false;
    }
    if (lang !== null) {
      const nextTrack = this.playerSettings.tracks.find(t => t.lang === lang)!;
      this.player.textTracks.getById(nextTrack._id)!.mode = 'showing';
      this.playerSettings.activeTrackValue = lang;
      this.playerSettings.showSubtitle = true;
      this.updateUserSettings({ player: { subtitle: true, subtitleLang: lang } });
    } else {
      this.playerSettings.showSubtitle = false;
      this.updateUserSettings({ player: { subtitle: false } });
    }
  }

  setInitAudioTrack(codec: number | null, surroundAudio: boolean | null) {
    if (!this.player || this.player.audioTracks.readonly) return;
    const audioTracks = this.player.audioTracks.toArray();
    let audioTrack: AudioTrack | undefined;
    // Select exact audio by codec
    if (codec !== null) {
      audioTrack = audioTracks.find(a => Number(a.label.split('-')[1]) === codec);
    }
    // Fallback option to select any stereo or surround track
    if (!audioTrack && surroundAudio !== null) {
      audioTrack = audioTracks.find(a => {
        const aCodec = Number(a.label.split('-')[1]);
        if (surroundAudio)
          return [AudioCodec.AAC_SURROUND, AudioCodec.OPUS_SURROUND].includes(aCodec);
        return [AudioCodec.AAC, AudioCodec.OPUS].includes(aCodec);
      });
    }
    if (!audioTrack) return;
    audioTrack.selected = true;
    this.playerSettings.activeAudioLang = audioTrack.language;
  }

  setAudioTrackByLang(lang: string, codec?: number | null): void {
    if (!this.player || this.player.audioTracks.readonly) return;
    const audioTracks = this.player.audioTracks.toArray();
    // Get all audio track with selected languages
    const filteredAudioTracks = audioTracks.filter(a => a.language === lang);
    if (!filteredAudioTracks.length) return;
    let audioTrack: AudioTrack | undefined;
    // Select exact audio by codec
    if (codec != null)
      audioTrack = filteredAudioTracks.find(a => Number(a.label.split('-')[1]) === codec);
    if (!audioTrack)
      audioTrack = filteredAudioTracks[0];
    audioTrack.selected = true;
  }

  togglePlay(): void {
    if (!this.playerStore.canPlay) return;
    if (this.playerStore.playing)
      this.player.pause();
    else
      this.player.play();
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
    if (this.player.muted && this.player.volume === 0)
      this.player.volume = 0.25; // Workaround
    this.player.muted = !this.player.muted;
    this.playerSettings.isMuted = this.player.muted;
    this.updateUserSettings({ player: { muted: this.player.muted } });
  }

  toggleFillScreen(): void {
    this.playerSettings.fillScreen = !this.playerSettings.fillScreen;
    this.resetTouchControlsTimeout();
  }

  toggleFullwindow(): void {
    this.playerSettings.fullWindow = !this.playerSettings.fullWindow;
    this.player.focus();
    this.player.scrollIntoView();
    this.requestFitWindow.next(this.playerSettings.fullWindow);
  }

  toggleFullscreen(): void {
    if (this.playerStore?.canFullscreen) {
      if (!this.playerStore.fullscreen)
        this.player.enterFullscreen();
      else
        this.player.exitFullscreen();
      this.resetTouchControlsTimeout();
    }
  }

  toggleSubtitle(): void {
    if (!this.player.textTracks.length) return;
    if (this.playerSettings.showSubtitle) {
      // This will also set enableSubtitle to false
      this.setPlayerTrack(null);
    } else if (this.playerSettings.tracks) {
      const nextTrack = this.playerSettings.activeTrackValue ?
        this.playerSettings.tracks.find(t => t.lang === this.playerSettings.activeTrackValue) :
        this.playerSettings.tracks[0];
      if (nextTrack) {
        this.player.textTracks.getById(nextTrack._id)!.mode = 'showing';
        this.playerSettings.activeTrackValue = nextTrack.lang;
      }
      this.playerSettings.showSubtitle = true;
    }
    this.updateUserSettings({ player: { subtitle: this.playerSettings.showSubtitle } });
  }

  toggleAutoNext(value: boolean): void {
    this.playerSettings.autoNext = value;
    this.updateUserSettings({ player: { autoNext: this.playerSettings.autoNext } });
  }

  seekTime(value: number): void {
    if (!this.player) return;
    this.player.currentTime += value;
  }

  updateUserSettings(updateUserSettingsDto: UpdateUserSettingsDto): void {
    if (!this.authService.currentUser) return;
    this.pendingUpdateSettings = {
      player: { ...this.pendingUpdateSettings.player, ...updateUserSettingsDto.player },
      subtitle: { ...this.pendingUpdateSettings.subtitle, ...updateUserSettingsDto.subtitle }
    };
    if (this.playerSettings.updateSettingsSub) {
      this.playerSettings.updateSettingsSub.unsubscribe();
    }
    this.playerSettings.updateSettingsSub = timer(3000).pipe(switchMap(() => {
      return this.usersService.updateSettings(this.authService.currentUser!._id, this.pendingUpdateSettings);
    })).subscribe(settings => {
      this.authService.currentUser = {
        ...this.authService.currentUser!,
        settings: { ...settings }
      };
      this.pendingUpdateSettings = {};
      this.ref.markForCheck();
    });
  }

  updateSubtitleStyles(): void {
    if (!this.userSettings) return;
    const settings = this.userSettings.subtitle;
    const textColor = settings.textColor != undefined ? ('#' + settings.textColor.toString(16)) : null;
    const backgroundColor = settings.bgColor != undefined ? ('#' + settings.bgColor.toString(16)) : null;
    const windowColor = settings.winColor != undefined ? ('#' + settings.winColor.toString(16)) : null;
    const textAlpha = settings.textAlpha != undefined ? settings.textAlpha : 100;
    const backgroundAlpha = settings.bgAlpha != undefined ? settings.bgAlpha : 100;
    const windowAlpha = settings.winAlpha != undefined ? settings.winAlpha : 100;
    this.playerSettings = {
      ...this.playerSettings,
      subtitleStyles: {
        'font-family': getFontFamily(settings.fontFamily),
        '--cue-font-size-scale': (settings.fontSize || 100) / 100,
        '--cue-color': prepareColor(textColor, textAlpha),
        '--cue-font-weight': scaleFontWeight(settings.fontWeight),
        '--cue-text-shadow': getTextEdgeStyle(settings.textEdge),
        '--cue-bg-color': prepareColor(backgroundColor, backgroundAlpha, 'transparent'),
        '--cue-window-color': prepareColor(windowColor, windowAlpha, 'transparent')
      }
    };
  }

  registerMediaSession(): void {
    // Check browser support and media data
    if (!('mediaSession' in navigator) || this.platform.FIREFOX || !this.media) return;
    // Set metadata
    const artwork: MediaImage[] = [];
    this.media.smallPosterUrl && artwork.push({ src: this.media.smallPosterUrl, sizes: '167x250' });
    this.media.thumbnailPosterUrl && artwork.push({ src: this.media.thumbnailPosterUrl, sizes: '300x450' });
    this.media.posterUrl && artwork.push({ src: this.media.posterUrl, sizes: '500x750' });
    const typeKey = this.media.type === MediaType.MOVIE ? 'mediaTypes.movie' : 'mediaTypes.tvShow';
    forkJoin([
      this.translocoService.selectTranslate(typeKey, {}, 'media').pipe(first()),
      this.translocoService.selectTranslate('episode.episodePrefix', {}, 'media').pipe(first())
    ]).pipe(first()).subscribe(([mediaType, episodePrefix]) => {
      let artistValue = mediaType;
      if (this.media!.type === MediaType.TV && this.streamData?.episode)
        artistValue += ' - ' + episodePrefix + ' ' + this.streamData.episode.epNumber;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.media!.title,
        artist: artistValue,
        artwork: artwork
      });
    });
    // Set action handlers
    const nextTrackFn = this.canReqNext ? () => { this.requestNext.emit() } : null;
    const prevTrackFn = this.canReqPrev ? () => { this.requestPrev.emit() } : null;
    try {
      navigator.mediaSession.setActionHandler('nexttrack', nextTrackFn);
      navigator.mediaSession.setActionHandler('previoustrack', prevTrackFn);
    } catch { }
    try {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        details.seekTime && (this.player.currentTime = details.seekTime);
      });
    } catch { }
  }

  // unregisterMediaSession(): void {
  //   navigator.mediaSession.metadata = null;
  //   navigator.mediaSession.setActionHandler('nexttrack', null);
  //   navigator.mediaSession.setActionHandler('previoustrack', null);
  //   navigator.mediaSession.setActionHandler('seekto', null);
  // };

  ngOnDestroy(): void {
    this.playerSettings.playerDestroyed.next();
    this.playerSettings.playerDestroyed.complete();
  }
}
