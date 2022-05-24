import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import '@vidstack/player/define/vds-media.js';
import '@vidstack/player/define/vds-video.js';
import '@vidstack/player/define/vds-play-button.js';
import '@vidstack/player/define/vds-volume-slider.js';
import '@vidstack/player/define/vds-time-slider.js';
import '@vidstack/player/define/vds-aspect-ratio.js';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlayerComponent implements OnInit {
  @Input() src?: string;

  constructor() { }

  ngOnInit(): void {
  }

}
