import { Component, OnInit, ChangeDetectionStrategy, Input, ElementRef, Renderer2, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { forkJoin } from 'rxjs';
import '@vidstack/player/define/vds-media.js';
import '@vidstack/player/define/vds-video.js';
import '@vidstack/player/define/vds-play-button.js';
import '@vidstack/player/define/vds-mute-button.js';
import '@vidstack/player/define/vds-fullscreen-button.js';
import '@vidstack/player/define/vds-volume-slider.js';
import '@vidstack/player/define/vds-time-slider.js';
import '@vidstack/player/define/vds-slider-value-text.js';
import '@vidstack/player/define/vds-aspect-ratio.js';
import '@vidstack/player/define/vds-gesture.js';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlayerComponent implements OnInit, AfterViewInit {
  @Input() src?: string;
  @ViewChildren('vdsVideo') allPlayers!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('playStatus') allPlayStatus!: QueryList<ElementRef<SVGElement>>;
  @ViewChildren('pauseStatus') allPauseStatus!: QueryList<ElementRef<SVGElement>>;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // TODO: Switch to ViewChild in case *ngIf is not used
    this.registerPlayerAnimation(this.allPlayers.first, this.allPlayStatus.first, this.allPauseStatus.first);
    /*
    forkJoin({
      allPlayers: this.allPlayers.changes,
      allPlayStatus: this.allPlayStatus.changes,
      allPauseStatus: this.allPauseStatus.changes
    }).subscribe((
      data: {
        allPlayers: QueryList<ElementRef<HTMLElement>>,
        allPlayStatus: QueryList<ElementRef<SVGElement>>,
        allPauseStatus: QueryList<ElementRef<SVGElement>>
      }) => {
      this.registerPlayerAnimation(data.allPlayers.first, data.allPlayStatus.first, data.allPauseStatus.first);
      // PUT TAKE UNTIL HERE
    });
    */
  }

  registerPlayerAnimation(player: ElementRef, playStatus: ElementRef, pauseStatus: ElementRef): void {
    player.nativeElement.addEventListener('vds-play', () => {
      this.renderer.addClass(playStatus.nativeElement, 'bezel-transition');
    });
    player.nativeElement.addEventListener('vds-pause', () => {
      this.renderer.addClass(pauseStatus.nativeElement, 'bezel-transition');
    });
    playStatus.nativeElement.addEventListener('animationend', () => {
      this.renderer.removeClass(playStatus.nativeElement, 'bezel-transition');
    });
    pauseStatus.nativeElement.addEventListener('animationend', () => {
      this.renderer.removeClass(pauseStatus.nativeElement, 'bezel-transition');
    });
  }

}
