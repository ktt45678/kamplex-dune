import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, ViewEncapsulation, Renderer2, OnChanges, SimpleChanges } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Platform } from '@angular/cdk/platform';
import { TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { type MediaPlayerElement, type MediaVolumeChangeEvent, type TextTrackInit, type MediaPlayRequestEvent, type MediaPauseRequestEvent, type MediaSeekRequestEvent, isVideoProvider, type MediaProviderSetupEvent, type MediaPlayEvent, type HLSAudioTrackLoadedEvent, type MediaLoadStartEvent, isHLSProvider } from 'vidstack';
import { Subject, buffer, debounceTime, filter, first, forkJoin, fromEvent, map, merge, switchMap, takeUntil, timer } from 'rxjs';

import { UpdateUserSettingsDto } from '../../../core/dto/users';
import { MediaDetails, MediaStream, UserSettings } from '../../../core/models';
import { AuthService, DestroyService, UsersService } from '../../../core/services';
import { VideoPlayerService } from './video-player.service';
import { KPTrack, PlayerSettings, PlayerStore, PlayerSupports } from './interfaces';
import { AudioCodec, MediaBreakpoints, MediaStorageType, MediaType } from '../../../core/enums';
import { getFontFamily, getTextEdgeStyle, prepareColor, scaleFontWeight, track_Id } from '../../../core/utils';

import 'vidstack/define/media-player.js';
import 'vidstack/define/media-time.js';
import 'vidstack/define/media-slider.js';
import 'vidstack/define/media-gesture.js';
import 'vidstack/define/media-captions.js';
import 'vidstack/define/media-time-slider.js';
import 'vidstack/define/media-volume-slider.js';
import 'vidstack/define/media-slider-value.js';
import 'vidstack/define/media-slider-thumbnail.js';

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
  @Output() requestAutoNext = new EventEmitter<void>();
  player!: MediaPlayerElement;
  playerSettings: PlayerSettings;
  playerSupports: PlayerSupports;
  mediaPlayToast?: HTMLElement;
  streamData?: MediaStream;
  playerStore: PlayerStore;
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
      this.player.onAttach(() => {
        this.onPlayerAttach();
      });
    }
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
    this.playerSettings = {
      playbackSpeeds: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      tracks: [],
      sourceBaseUrl: '',
      previewThumbnail: null,
      activeQualityValue: 0,
      activeSpeedValue: 1,
      activeTrackValue: null,
      initAudioValue: null,
      autoNext: false,
      showSubtitle: false,
      showFastForward: false,
      showRewind: false,
      fullWindow: false,
      fillScreen: false,
      initPlaytime: 0,
      initVolume: 1,
      initMuted: false,
      expandVolumeSlider: false,
      isMenuOpen: false,
      hasError: false,
      subtitleStyles: null,
      playerDestroyed: new Subject(),
      storeDisposeFn: [],
      touchIdleTimeoutValue: 2500
    };
    const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    const isMinMobileScreen = this.breakpointObserver.isMatched(MediaBreakpoints.SMALL);
    this.playerSupports = {
      isMobile: this.platform.ANDROID || this.platform.IOS || (isTouchDevice && isMinMobileScreen),
      isSafari: this.platform.SAFARI,
      isTouchDevice: isTouchDevice,
      hlsOpus: this.platform.FIREFOX
    };
    this.playerStore = {
      autoplayError: undefined,
      audioTracks: [],
      audioTrack: null,
      textTrack: null,
      canFullscreen: false,
      canPlay: false,
      currentTime: 0,
      error: undefined,
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

  setPlayerData(data: MediaStream): void {
    const tracks: KPTrack[] = [];
    if (data.subtitles?.length) {
      this.translocoService.selectTranslation('languages').pipe(first()).subscribe(t => {
        data.subtitles.sort().forEach(subtitle => {
          tracks.push({
            _id: subtitle._id,
            label: t[subtitle.lang],
            lang: subtitle.lang,
            src: subtitle.src
          });
        });
        this.playerSettings.tracks = tracks;
        this.setPlayerTrackList();
      });
    }
    this.playerSettings.sourceBaseUrl = data.baseUrl;
    this.playerSettings.previewThumbnail = data.baseUrl.replace(':path', data.previewThumbnail);
    this.setPlayerSource();
  }

  applyUserSettings(): void {
    if (!this.userSettings) return;
    if (this.userSettings.player.speed != undefined && this.userSettings.player.speed >= 0)
      this.playerSettings.activeSpeedValue = this.userSettings.player.speed / 100;
    if (this.userSettings.player.muted)
      this.playerSettings.initMuted = this.userSettings.player.muted;
    if (this.userSettings.player.audioTrack != undefined)
      this.playerSettings.initAudioValue = this.userSettings.player.audioTrack;
    if (this.userSettings.player.quality != undefined)
      this.playerSettings.activeQualityValue = this.userSettings.player.quality;
    if (this.userSettings.player.subtitle != undefined)
      this.playerSettings.showSubtitle = this.userSettings.player.subtitle;
    if (this.userSettings.player.volume != undefined)
      this.playerSettings.initVolume = this.userSettings.player.volume / 100;
  }

  private onPlayerAttach() {
    this.player.currentTime = this.playerSettings.initPlaytime;
    this.player.muted = this.playerSettings.initMuted;
    this.player.volume = this.playerSettings.initVolume;
    this.player.playbackRate = this.playerSettings.activeSpeedValue;
    if (this.playerSettings.activeQualityValue)
      this.changeVideoQuality(this.playerSettings.activeQualityValue);
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
    // Register media session when the media starts playing
    fromEvent<MediaLoadStartEvent>(this.player, 'load-start')
      .pipe(takeUntil(this.playerSettings.playerDestroyed)).subscribe(() => {
        this.registerMediaSession();
      });
    // Update user volume setting when user changes the volume
    fromEvent<MediaVolumeChangeEvent>(this.player, 'volume-change')
      .pipe(debounceTime(1000), takeUntil(this.playerSettings.playerDestroyed)).subscribe(event => {
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
          this.handleTouchUserIdle();
        });
    }
    // Set init audio track when track list is available
    fromEvent<HLSAudioTrackLoadedEvent>(this.player, 'hls-audio-track-loaded').pipe(first()).subscribe(() => {
      if (this.playerSettings.initAudioValue === null) return;
      this.setInitAudioTrack(this.playerSettings.initAudioValue);
    });
    const setPlayerStoreProp = (props: Partial<PlayerStore>) => {
      this.playerStore = { ...this.playerStore, ...props };
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

  private handleTouchUserIdle(): void {
    if (!isHLSProvider(this.player.provider)) return;
    const idleAttributeName = 'data-touch-user-idle';
    const click$ = fromEvent<MouseEvent>(this.player.provider.video, 'click');
    const clearIdleTimeoutFn = () => {
      if (this.playerSettings.touchIdleTimeout) {
        window.clearTimeout(this.playerSettings.touchIdleTimeout);
        this.playerSettings.touchIdleTimeout = undefined;
      }
    };
    // Toggle user idle attribute on tap
    click$.pipe(
      buffer(click$.pipe(debounceTime(200))),
      takeUntil(this.playerSettings.playerDestroyed)
    ).subscribe(events => {
      // Only accept single click, ignore seek gestures
      if (events.length > 1) return;
      if (this.player.hasAttribute(idleAttributeName)) {
        this.renderer.removeAttribute(this.player, idleAttributeName);
        // Set idle after timeout, clear current timeout if exist
        clearIdleTimeoutFn();
        this.playerSettings.touchIdleTimeout = window.setTimeout(() => {
          this.renderer.setAttribute(this.player, idleAttributeName, 'true');
        }, this.playerSettings.touchIdleTimeoutValue);
      }
      else {
        this.renderer.setAttribute(this.player, idleAttributeName, 'true');
        clearIdleTimeoutFn();
      }
    });
    // Keep idle attribute when started playing
    fromEvent<MediaPlayEvent>(this.player, 'play').pipe(takeUntil(this.playerSettings.playerDestroyed)).subscribe(() => {
      this.resetTouchIdleTimeout();
    });
  }

  private resetTouchIdleTimeout(): void {
    if (!this.playerSupports.isTouchDevice) return;
    const idleAttributeName = 'data-touch-user-idle';
    this.renderer.removeAttribute(this.player, idleAttributeName);
    if (this.playerSettings.touchIdleTimeout)
      window.clearTimeout(this.playerSettings.touchIdleTimeout);
    this.playerSettings.touchIdleTimeout = window.setTimeout(() => {
      this.renderer.setAttribute(this.player, idleAttributeName, 'true');
    }, this.playerSettings.touchIdleTimeoutValue);
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
    if (!this.player || !this.player.textTracks) return;
    const defaultLanguage = this.userSettings?.player.subtitleLang || this.translocoService.getActiveLang();
    this.player.textTracks.clear();
    this.playerSettings.tracks.forEach((track) => {
      const trackType = <'vtt' | 'srt' | 'ass' | 'ssa'>track.src.substring(track.src.lastIndexOf('.') + 1);
      const textTrack: TextTrackInit = {
        id: track._id,
        label: track.label,
        language: track.lang,
        src: track.src,
        kind: 'subtitles',
        type: trackType
      };
      if (this.userSettings?.player.subtitle && track.lang === defaultLanguage) {
        textTrack.default = true;
        this.playerSettings.activeTrackValue = textTrack.language!;
        this.playerSettings.showSubtitle = true;
      }
      this.player.textTracks.add(textTrack);
    });
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
    this.videoPlayerService.generateM3U8(playlistSrc, this.playerSettings.sourceBaseUrl, { opus: this.playerSupports.hlsOpus })
      .subscribe(uri => {
        this.player.src = {
          src: uri,
          type: 'application/x-mpegurl'
        };
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
    const audioTrackCodec = Number(audioTrack.label.split('-').pop()) || 1;
    this.updateUserSettings({ player: { audioTrack: audioTrackCodec } });
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

  setInitAudioTrack(codec: number) {
    if (!this.player || this.player.audioTracks.readonly) return;
    const audioTrack = this.player.audioTracks.toArray().find(a => Number(a.label.split('-').pop()) === codec);
    if (!audioTrack) return;
    audioTrack.selected = true;
  }

  togglePlay(): void {
    if (!this.playerStore.canPlay) return;
    if (this.playerStore.playing)
      this.player.pause();
    else
      this.player.play();
  }

  toggleNext(): void {
    this.requestNext.emit();
    this.resetTouchIdleTimeout();
  }

  togglePrev(): void {
    this.requestPrev.emit();
    this.resetTouchIdleTimeout();
  }

  toggleMute(): void {
    if (this.player.muted && this.player.volume === 0)
      this.player.volume = 0.25; // Workaround
    this.player.muted = !this.player.muted;
    this.updateUserSettings({ player: { muted: !this.player.muted } });
  }

  toggleFillScreen(): void {
    this.playerSettings.fillScreen = !this.playerSettings.fillScreen;
    this.resetTouchIdleTimeout();
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
      this.resetTouchIdleTimeout();
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
    this.playerSettings.updateSettingsSub = timer(5000).pipe(switchMap(() => {
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
