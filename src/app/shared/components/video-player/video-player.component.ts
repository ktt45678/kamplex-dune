import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, ViewEncapsulation, Renderer2 } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { MediaPlayerElement, MediaStore } from 'vidstack';
import { Dispose } from 'maverick.js';
import { first } from 'rxjs';

import { MediaStream } from '../../../core/models';
import { KPTrack, KPVideoSource } from './interfaces';
import { track_Id } from '../../../core/utils';

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
  previewThumbnail?: string;
  activeSourceIndex: number = 0;
  activeSpeedValue: number = 1;
  activeTrackValue: string | null = null;
  trackDisabled: boolean = true;
  isVolumeCtrlActive: boolean = false;
  isMobile: boolean = false;

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
    private translocoService: TranslocoService) {
    this.isMobile = this.platform.ANDROID || this.platform.IOS;
    this.playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  }

  ngOnInit(): void {

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
    this.setPlayerTrackList();
    this.setPlayerSource();
  }

  onPlayerAttach() {
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
    this.player.textTracks.clear();
    this.tracks?.forEach((track) => {
      const trackType = <'vtt' | 'srt' | 'ass' | 'ssa'>track.src.substring(track.src.lastIndexOf('.') + 1);
      this.player.textTracks.add({
        id: track._id,
        label: track.lang,
        language: track.lang,
        src: track.src,
        kind: 'subtitles',
        type: trackType
      });
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
  }

  setPlayerSource(index?: number): void {
    if (!this.player || !this.playerStore) return;
    index && (this.activeSourceIndex = index);
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
  }

  setPlayerTrack(lang: string | null): void {
    if (!this.player) return;
    if (!this.trackDisabled && this.player.textTracks.selected) {
      this.player.textTracks.selected.mode = 'disabled';
      this.trackDisabled = true;
    }
    if (lang !== null) {
      const nextTrack = this.tracks!.find(t => t.lang === lang)!;
      this.player.textTracks.getById(nextTrack._id)!.mode = 'showing';
      this.activeTrackValue = lang;
      this.trackDisabled = false;
    } else {
      this.trackDisabled = true;
    }
  }

  togglePlay(): void {
    this.player.paused = !this.player.paused;
  }

  toggleMute(): void {
    if (this.player.muted && this.player.volume === 0)
      this.player.volume = 0.25; // Workaround
    this.player.muted = !this.player.muted;
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
    if (!this.trackDisabled) {
      this.setPlayerTrack(null);
    } else if (this.tracks) {
      const nextTrack = this.activeTrackValue ? this.tracks.find(t => t.lang === this.activeTrackValue) : this.tracks[0];
      if (nextTrack) {
        this.player.textTracks.getById(nextTrack._id)!.mode = 'showing';
        this.activeTrackValue = nextTrack.lang;
      }
      this.trackDisabled = false;
    }
  }

  ngOnDestroy(): void {
    this.playerDisposeFn.forEach(fn => {
      fn();
    });
    this.player?.destroy();
  }
}
