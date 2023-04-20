import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, ViewEncapsulation, Renderer2 } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { MediaPlayerElement, MediaStore, MediaVolumeChangeEvent, TextTrackInit } from 'vidstack';
import { Dispose } from 'maverick.js';
import { debounceTime, first, fromEvent, takeUntil } from 'rxjs';

import { UpdateUserSettingsDto } from '../../../core/dto/users';
import { MediaStream, UserSettings } from '../../../core/models';
import { AuthService, DestroyService, UsersService } from '../../../core/services';
import { KPTrack, KPVideoSource } from './interfaces';
import { getFontFamily, getTextEdgeStyle, prepareColor, scaleFontSize, scaleFontWeight, track_Id } from '../../../core/utils';

import 'vidstack/define/media-player.js';
import 'vidstack/define/media-time.js';
import 'vidstack/define/media-slider.js';
import 'vidstack/define/media-captions.js';
import 'vidstack/define/media-time-slider.js';
import 'vidstack/define/media-volume-slider.js';
import 'vidstack/define/media-slider-value.js';
import 'vidstack/define/media-slider-thumbnail.js';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
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
  @Output() onEnded = new EventEmitter<void>();
  player!: MediaPlayerElement;
  readonly playbackSpeeds: number[];
  currentStream?: MediaStream;
  sources?: KPVideoSource[];
  tracks?: KPTrack[];
  playerDisposeFn: Dispose[] = [];
  playerStore?: MediaStore;
  userSettings: UserSettings | null = null;
  previewThumbnail?: string;
  activeSourceIndex: number = 0;
  activeSpeedValue: number = 1;
  activeTrackValue: string | null = null;
  enableSubtitle: boolean = false;
  initVolume: number = 1;
  initMuted: boolean = false;
  isVolumeCtrlActive: boolean = false;
  isMobile: boolean = false;
  subtitleStyles: NgStyle['ngStyle'];

  @Input('stream') set setStreamData(value: MediaStream | undefined) {
    if (!value || this.currentStream === value) return;
    this.currentStream = value;
    this.setPlayerData(value);
  }

  @ViewChild('player') set setPlayer(value: ElementRef<MediaPlayerElement>) {
    if (!this.player && value) {
      this.player = value.nativeElement;
      this.player.onAttach(() => {
        this.onPlayerAttach();
      });
    }
  }

  constructor(private ref: ChangeDetectorRef, private renderer: Renderer2, private platform: Platform,
    private translocoService: TranslocoService, private authService: AuthService, private usersService: UsersService,
    private destroyService: DestroyService) {
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
    const sources: KPVideoSource[] = [];
    const tracks: KPTrack[] = [];
    data.streams?.forEach(file => {
      if (file.codec === 1) {
        sources.push({
          _id: file._id,
          src: file.src,
          type: file.mimeType,
          size: file.quality
        });
      }
    });
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
    this.sources = sources;
    this.tracks = tracks;
    this.previewThumbnail = data.previewThumbnail;
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
    if (this.userSettings.player.quality) {
      const savedSourceIndex = this.sources!.findIndex(s => s.size === this.userSettings!.player.quality);
      if (savedSourceIndex > -1) {
        this.activeSourceIndex = savedSourceIndex;
      }
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
    if (this.sources?.length && this.activeSourceIndex > -1) {
      this.player.src = {
        src: this.sources[this.activeSourceIndex].src,
        type: this.sources[this.activeSourceIndex].type
      };
    }
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
    fromEvent<MediaVolumeChangeEvent>(this.player, 'volume-change')
      .pipe(debounceTime(1000), takeUntil(this.destroyService)).subscribe(event => {
        if (!this.userSettings || event.detail.volume * 100 === this.userSettings.player.volume) return;
        this.updateUserSettings({ player: { muted: event.detail.muted, volume: Math.round(event.detail.volume * 100) } });
      });
    this.playerDisposeFn.push(
      this.player.subscribe((store => {
        this.playerStore = store;
        this.ref.detectChanges();
      })),
      this.player.subscribe((({ ended }) => {
        if (!ended) return;
        this.onEnded.emit();
      }))
    );
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

  onSettingsMenuClick(button: HTMLButtonElement, opened: boolean): void {
    this.renderer[opened ? 'removeClass' : 'addClass'](button, 'media-settings-button-active');
    this.renderer[opened ? 'addClass' : 'removeClass'](button, 'media-settings-button-active');
  }

  setPlaybackSpeed(speed: number = 1): void {
    if (!this.player) return;
    this.player.playbackRate = speed;
    this.activeSpeedValue = speed;
    this.updateUserSettings({ player: { speed: speed * 100 } });
  }

  setPlayerSource(index?: number): void {
    if (!this.player || !this.playerStore) return;
    index != undefined && (this.activeSourceIndex = index);
    this.player.src = {
      src: this.sources![this.activeSourceIndex].src,
      type: this.sources![this.activeSourceIndex].type
    };
  }

  changePlayerQuality(index: number): void {
    if (!this.player || !this.playerStore) return;
    const time = this.playerStore.currentTime;
    const isPlaying = this.playerStore.playing;
    // Set selected source
    this.setPlayerSource(index);
    // Resume playing media
    this.player.addEventListener('can-play', () => {
      this.player.currentTime = time;
      isPlaying && this.player.play();
    }, { once: true });
    this.updateUserSettings({ player: { quality: this.sources![index].size } });
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

  toggleMute(): void {
    if (this.player.muted && this.player.volume === 0)
      this.player.volume = 0.25; // Workaround
    this.player.muted = !this.player.muted;
    this.updateUserSettings({ player: { muted: !this.player.muted } });
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

  updateUserSettings(updateUserSettingsDto: UpdateUserSettingsDto): void {
    if (!this.authService.currentUser) return;
    this.usersService.updateSettings(this.authService.currentUser._id, updateUserSettingsDto).subscribe(settings => {
      this.authService.currentUser = {
        ...this.authService.currentUser!,
        settings: { ...settings }
      };
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
      '--cue-font-size-normal': scaleFontSize(32, settings.fontSize || 100),
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
