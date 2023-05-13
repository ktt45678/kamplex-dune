import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, ViewEncapsulation, Renderer2 } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { NgStyle } from '@angular/common';
import { TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { MediaPlayerElement, MediaVolumeChangeEvent, MediaPlayEvent, MediaPauseEvent, TextTrackInit } from 'vidstack';
import { Dispose } from 'maverick.js';
import { Subscription, debounceTime, first, fromEvent, merge, switchMap, takeUntil, timer } from 'rxjs';

import { UpdateUserSettingsDto } from '../../../core/dto/users';
import { MediaStream, UserSettings } from '../../../core/models';
import { AuthService, DestroyService, UsersService } from '../../../core/services';
import { VideoPlayerService } from './video-player.service';
import { KPTrack, PlayerStore, PlayerStoreAudio, PlayerStoreQuality } from './interfaces';
import { AudioCodec, VideoCodec } from '../../../core/enums';
import { getFontFamily, getTextEdgeStyle, prepareColor, scaleFontWeight, track_Id } from '../../../core/utils';

import 'vidstack/define/media-player.js';
import 'vidstack/define/media-time.js';
import 'vidstack/define/media-slider.js';
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
      useValue: ['languages', 'player']
    }
  ]
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  track_Id = track_Id;
  AudioCodec = AudioCodec;
  @Input() canFullWindow: boolean = false;
  @Input() canReqNextEp: boolean = false;
  @Input() canReqPrevEp: boolean = false;
  @Output() onEnded = new EventEmitter<void>();
  @Output() requestFullWindow = new EventEmitter<boolean>();
  @Output() requestNextEp = new EventEmitter<void>();
  @Output() requestPrevEp = new EventEmitter<void>();
  readonly playbackSpeeds: number[];
  player!: MediaPlayerElement;
  mediaToast?: HTMLElement;
  streamData?: MediaStream;
  tracks?: KPTrack[];
  playerDisposeFn: Dispose[] = [];
  playerStore?: PlayerStore;
  playerStoreQuality?: PlayerStoreQuality;
  playerStoreAudio?: PlayerStoreAudio;
  userSettings: UserSettings | null = null;
  sourceBaseUrl: string = '';
  previewThumbnail?: string;
  activeQuality: number = 1;
  activeSpeedValue: number = 1;
  activeTrackValue: string | null = null;
  enableSubtitle: boolean = false;
  fullWindow: boolean = false;
  initVolume: number = 1;
  initMuted: boolean = false;
  isVolumeCtrlActive: boolean = false;
  isMobile: boolean = false;
  isMenuOpen: boolean = false;
  subtitleStyles: NgStyle['ngStyle'];
  pendingUpdateSettings: UpdateUserSettingsDto = {};
  toastAnimEndSub?: Subscription;
  updateSettingsSub?: Subscription;

  @Input('stream') set setStreamData(value: MediaStream | undefined) {
    if (!value || this.streamData === value) return;
    this.streamData = value;
    this.setPlayerData(value);
  }

  @ViewChild('player') set setPlayer(value: ElementRef<MediaPlayerElement> | undefined) {
    if (!this.player && value) {
      this.player = value.nativeElement;
      this.player.onAttach(() => {
        this.onPlayerAttach();
      });
    }
  }

  @ViewChild('mediaToast') set setMediaToast(value: ElementRef<HTMLElement> | undefined) {
    if (this.toastAnimEndSub)
      this.toastAnimEndSub.unsubscribe();
    this.mediaToast = value?.nativeElement;
    if (!this.mediaToast) return;
    this.toastAnimEndSub = fromEvent(this.mediaToast, 'animationend').subscribe(() => {
      this.renderer.removeClass(this.mediaToast, 'media-toast-active');
    });
  }

  constructor(private ref: ChangeDetectorRef, private renderer: Renderer2, private platform: Platform,
    private translocoService: TranslocoService, private authService: AuthService, private usersService: UsersService,
    private videoPlayerService: VideoPlayerService, private destroyService: DestroyService) {
    this.isMobile = this.platform.ANDROID || this.platform.IOS;
    this.playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      this.userSettings = user?.settings || null;
      this.updateSubtitleStyles();
      this.ref.markForCheck();
    });
  }

  setPlayerData(data: MediaStream): void {
    const tracks: KPTrack[] = [];
    this.sourceBaseUrl = data.baseUrl;
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
      });
    }
    this.tracks = tracks;
    this.previewThumbnail = this.sourceBaseUrl.replace(':path', data.previewThumbnail);
    this.applyUserSettings();
    this.setPlayerTrackList();
    this.setPlayerSource();
  }

  applyUserSettings(): void {
    if (!this.userSettings) return;
    if (this.userSettings.player.speed != undefined && this.userSettings.player.speed >= 0) {
      this.activeSpeedValue = this.userSettings.player.speed / 100;
    }
    if (this.userSettings.player.muted) {
      this.initMuted = this.userSettings.player.muted;
    }
    if (this.userSettings.player.quality != undefined) {
      this.activeQuality = this.userSettings.player.quality;
    }
    if (this.userSettings.player.subtitle != undefined) {
      this.enableSubtitle = this.userSettings.player.subtitle;
    }
    if (this.userSettings.player.volume != undefined) {
      this.initVolume = this.userSettings.player.volume / 100;
    }
  }

  onPlayerAttach() {
    this.player.muted = this.initMuted;
    this.player.volume = this.initVolume;
    this.player.playbackRate = this.activeSpeedValue;
    if (this.activeQuality) {
      const qualityIndex = this.player.qualities.toArray().findIndex(q => q.height === this.activeQuality);
      this.changeVideoQuality(qualityIndex);
    }
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
    // Update user volume setting when user changes the volume
    fromEvent<MediaVolumeChangeEvent>(this.player, 'volume-change')
      .pipe(debounceTime(1000), takeUntil(this.destroyService)).subscribe(event => {
        if (!this.userSettings || event.detail.volume * 100 === this.userSettings.player.volume) return;
        this.updateUserSettings({ player: { muted: event.detail.muted, volume: Math.round(event.detail.volume * 100) } });
      });
    // Show play or pause icon toast when user plays/pauses the video
    merge(
      fromEvent<MediaPlayEvent>(this.player, 'play'),
      fromEvent<MediaPauseEvent>(this.player, 'pause')
    ).pipe(takeUntil(this.destroyService)).subscribe(event => {
      if (!event.isOriginTrusted || !this.mediaToast) return;
      //this.renderer.removeClass(this.mediaToast, 'media-toast-active');
      this.renderer.addClass(this.mediaToast, 'media-toast-active');
    });
    // Subscribe to the media store
    this.playerDisposeFn.push(
      this.player.subscribe(({ canPlay, waiting, playing, paused, muted, volume, fullscreen, canFullscreen, currentTime }) => {
        this.playerStore = { canPlay, waiting, playing, paused, muted, volume, fullscreen, canFullscreen, currentTime };
        this.ref.detectChanges();
      })),
      this.player.subscribe(({ qualities, quality, autoQuality, canSetQuality }) => {
        this.playerStoreQuality = { qualities, quality, autoQuality, canSetQuality };
        this.ref.detectChanges();
      }),
      this.player.subscribe(({ audioTracks, audioTrack }) => {
        this.playerStoreAudio = { audioTracks, audioTrack };
        this.ref.detectChanges();
      }),
      this.player.subscribe((({ ended }) => {
        if (!ended) return;
        this.onEnded.emit();
      }));
  }

  onMenuCheckBoxClick(): void {
    this.ref.detectChanges();
  }

  setPlayerTrackList(): void {
    if (!this.player || !this.player.textTracks) return;
    const defaultLanguage = this.userSettings?.player.subtitleLang || this.translocoService.getActiveLang();
    this.player.textTracks.clear();
    this.tracks?.forEach((track) => {
      const trackType = <'vtt' | 'srt' | 'ass' | 'ssa'>track.src.substring(track.src.lastIndexOf('.') + 1);
      const textTrack: TextTrackInit = {
        id: track._id,
        label: track.lang,
        language: track.lang,
        src: track.src,
        kind: 'subtitles',
        type: trackType
      };
      if (this.userSettings?.player.subtitle && track.lang === defaultLanguage) {
        textTrack.default = true;
        this.activeTrackValue = textTrack.language!;
        this.enableSubtitle = true;
      }
      this.player.textTracks.add(textTrack);
    });
  }

  setPlaybackSpeed(speed: number = 1): void {
    if (!this.player) return;
    this.player.playbackRate = speed;
    this.activeSpeedValue = speed;
    this.updateUserSettings({ player: { speed: speed * 100 } });
  }

  setPlayerSource(): void {
    if (!this.player || !this.streamData?.streams) return;
    const playlist = this.streamData.streams.find(s => s.name === `manifest_${VideoCodec.H264}.json`);
    if (!playlist) return;
    const playlistSrc = this.sourceBaseUrl.replace(':path', `${playlist._id}/${playlist.name}`);
    this.videoPlayerService.generateM3U8(playlistSrc, this.sourceBaseUrl)
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
    //this.updateUserSettings({ player: { quality: quality.height } });
  }

  changeVideoQuality(index: number): void {
    if (!this.player || this.player.qualities.readonly) return;
    // Set selected quality
    if (index === -1) {
      this.player.qualities.autoSelect();
      this.updateUserSettings({ player: { quality: 0 } });
    } else {
      const quality = this.player.qualities[index];
      if (!quality) return;
      quality.selected = true;
      this.updateUserSettings({ player: { quality: quality.height } });
    }
  }

  setPlayerTrack(lang: string | null): void {
    if (!this.player) return;
    if (this.enableSubtitle && this.player.textTracks.selected) {
      this.player.textTracks.selected.mode = 'disabled';
      this.enableSubtitle = false;
    }
    if (lang !== null) {
      const nextTrack = this.tracks!.find(t => t.lang === lang)!;
      this.player.textTracks.getById(nextTrack._id)!.mode = 'showing';
      this.activeTrackValue = lang;
      this.enableSubtitle = true;
      this.updateUserSettings({ player: { subtitle: true, subtitleLang: lang } });
    } else {
      this.enableSubtitle = false;
      this.updateUserSettings({ player: { subtitle: false } });
    }
  }

  togglePlay(): void {
    this.player.paused = !this.player.paused;
  }

  toggleNext(): void {
    this.unsetPlayerSource();
    this.requestNextEp.emit();
  }

  togglePrev(): void {
    this.unsetPlayerSource();
    this.requestPrevEp.emit();
  }

  toggleMute(): void {
    if (this.player.muted && this.player.volume === 0)
      this.player.volume = 0.25; // Workaround
    this.player.muted = !this.player.muted;
    this.updateUserSettings({ player: { muted: !this.player.muted } });
  }

  toggleFullwindow(): void {
    this.fullWindow = !this.fullWindow;
    this.requestFullWindow.next(this.fullWindow);
  }

  toggleFullscreen(): void {
    if (this.playerStore?.canFullscreen) {
      if (!this.playerStore.fullscreen)
        this.player.enterFullscreen();
      else
        this.player.exitFullscreen();
    }
  }

  toggleSubtitle(): void {
    if (!this.player.textTracks.length) return;
    if (this.enableSubtitle) {
      // This will also set enableSubtitle to false
      this.setPlayerTrack(null);
    } else if (this.tracks) {
      const nextTrack = this.activeTrackValue ? this.tracks.find(t => t.lang === this.activeTrackValue) : this.tracks[0];
      if (nextTrack) {
        this.player.textTracks.getById(nextTrack._id)!.mode = 'showing';
        this.activeTrackValue = nextTrack.lang;
      }
      this.enableSubtitle = true;
    }
    this.updateUserSettings({ player: { subtitle: this.enableSubtitle } });
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
    if (this.updateSettingsSub) {
      this.updateSettingsSub.unsubscribe();
    }
    this.updateSettingsSub = timer(5000).pipe(switchMap(() => {
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
    this.subtitleStyles = {
      'font-family': getFontFamily(settings.fontFamily),
      '--cue-font-size-scale': (settings.fontSize || 100) / 100,
      '--cue-color': prepareColor(textColor, textAlpha),
      '--cue-font-weight': scaleFontWeight(settings.fontWeight),
      '--cue-text-shadow': getTextEdgeStyle(settings.textEdge),
      '--cue-bg-color': prepareColor(backgroundColor, backgroundAlpha, 'transparent'),
      '--cue-window-color': prepareColor(windowColor, windowAlpha, 'transparent')
    };
  }

  ngOnDestroy(): void {
    this.playerDisposeFn.forEach(fn => {
      fn();
    });
  }
}
