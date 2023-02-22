import { DOCUMENT } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges, OnDestroy, Inject, Output, EventEmitter } from '@angular/core';
import Hls from 'hls.js';
import * as Plyr from 'plyr';

import { ExtStreamList } from '../../../core/models';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlayerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() source?: Plyr.SourceInfo;
  @Input() hlsSource?: ExtStreamList;
  @Input() previewThumbnail?: string;
  @Output() onEnded = new EventEmitter<Plyr.PlyrEvent>();
  player?: Plyr;
  hls?: Hls
  playerOptions: Plyr.Options;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.playerOptions = {
      captions: { active: true },
      controls: ['play-large', 'play', 'rewind', 'fast-forward', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
      settings: ['captions', 'quality', 'speed', 'loop'],
      autoplay: true,
      previewThumbnails: { enabled: true },
      i18n: {
        qualityLabel: {
          0: 'Auto'
        }
      }
    };
  }

  ngOnInit(): void {
    this.setPlayerSource(this.source, this.hlsSource);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setPlayerSource(changes['source']?.currentValue, changes['hlsSource']?.currentValue);
    if (changes['previewThumbnail']) {
      this.player?.setPreviewThumbnails({
        src: changes['previewThumbnail'].currentValue
      });
    }
  }

  setPlayerSource(source?: Plyr.SourceInfo, hlsSource?: ExtStreamList) {
    if (this.hls) {
      this.hls.detachMedia();
      this.hls.destroy();
    }
    if (this.player) {
      this.player.destroy();
    }
    if (source?.sources.length) {
      this.player = new Plyr('#plyrPlayer', this.playerOptions);
      this.player.on('ended', (event) => {
        this.onEnded.emit(event);
      });
      this.player.source = source;
      this.player.play();
    } else if (hlsSource) {
      const sourceUrl = this.findAvailableHlsSource(hlsSource);
      if (!sourceUrl) return;
      const videoElement = this.document.getElementById('plyrPlayer') as HTMLMediaElement;
      if (!Hls.isSupported()) {
        videoElement.src = sourceUrl;
        this.player = new Plyr('#plyrPlayer', this.playerOptions);
        this.player.on('ended', (event) => {
          this.onEnded.emit(event);
        });
        this.player.play();
      } else {
        const hls = new Hls();
        hls.loadSource(sourceUrl);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const availableQualities = hls.levels.map((l) => l.height).reverse();
          availableQualities.push(0);
          const hlsPlayerOptions: Plyr.Options = {
            ...this.playerOptions,
            quality: {
              default: 0,
              options: availableQualities,
              forced: true,
              onChange: (e: number) => this.updateHlsQuality(e)
            }
          };
          this.player = new Plyr(videoElement, hlsPlayerOptions);
          this.player.on('ended', (event) => {
            this.onEnded.emit(event);
          });
          this.player.play();
        });
        hls.attachMedia(videoElement);
        this.hls = hls;
      }
    }
  }

  updateHlsQuality(newQuality: number) {
    if (!this.hls) return;
    if (newQuality === 0) {
      this.hls.currentLevel = -1;
      return;
    }
    const levelIndex = this.hls.levels.findIndex((level: any) => level.height === newQuality);
    this.hls.currentLevel = levelIndex;
  }

  findAvailableHlsSource(extStreamList: ExtStreamList) {
    if (extStreamList.zoroStream) {
      return extStreamList.zoroStream.sources[0].url;
    } else if (extStreamList.flixHQStream) {
      return extStreamList.flixHQStream.sources[0].url;
    } else {
      return extStreamList.gogoAnimeStreamUrl;
    }
  }

  ngOnDestroy(): void {
    this.player?.destroy();
    this.hls?.detachMedia();
    this.hls?.destroy();
  }
}
