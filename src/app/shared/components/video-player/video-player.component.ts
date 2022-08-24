import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import * as Plyr from 'plyr';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlayerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() source?: Plyr.SourceInfo;
  player?: Plyr;

  constructor() { }

  ngOnInit(): void {
    this.player = new Plyr('#plyrPlayer', {
      captions: { active: true },
      controls: ['play-large', 'play', 'rewind', 'fast-forward', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
      settings: ['captions', 'quality', 'speed', 'loop'],
      autoplay: true
    });
    if (this.source) {
      this.player.source = this.source;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['source']?.currentValue && this.player) {
      this.player.source = changes['source'].currentValue;
    }
  }

  ngOnDestroy(): void {
    this.player?.destroy();
  }
}
