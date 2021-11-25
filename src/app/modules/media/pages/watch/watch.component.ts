import { Component, OnInit, ChangeDetectionStrategy, AfterContentInit, OnDestroy } from '@angular/core';
import * as Plyr from 'plyr';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WatchComponent implements OnInit, OnDestroy {
  player?: Plyr;

  constructor() { }

  ngOnInit(): void {
    this.player = new Plyr('#plyrPlayer', {
      captions: { active: true },
      controls: ['play-large', 'play', 'rewind', 'fast-forward', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
      settings: ['captions', 'quality', 'speed', 'loop'],
      autoplay: true
    });
  }

  ngOnDestroy(): void {
    if (this.player)
      this.player.destroy();
  }

}
