import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs';
import ISO6391 from 'iso-639-1';
import * as Plyr from 'plyr';

import { MediaService } from '../../../../core/services';
import { DestroyService } from '../../../../core/services';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class WatchComponent implements OnInit, OnDestroy {
  player?: Plyr;
  selectedCodec: number = 1;

  constructor(private meta: Meta, private mediaService: MediaService, private route: ActivatedRoute, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.player = new Plyr('#plyrPlayer', {
      captions: { active: true },
      controls: ['play-large', 'play', 'rewind', 'fast-forward', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
      settings: ['captions', 'quality', 'speed', 'loop'],
      autoplay: true
    });
    this.route.params.pipe(takeUntil(this.destroyService)).subscribe(params => {
      const id = params['id'];
      if (!id) return;
      this.watchMovie(id);
    });
  }

  watchMovie(id: string): void {
    this.mediaService.findOne(id).subscribe(media => {
      this.meta.addTags([
        {
          name: 'description',
          content: 'Watch on KamPlex'
        },
        {
          property: 'og:site_name',
          content: 'KamPlex'
        },
        {
          property: 'og:title',
          content: media.title
        },
        {
          property: 'og:description',
          content: 'Watch on KamPlex'
        }
      ]);
    });
    this.mediaService.findMovieStreams(id).subscribe(movie => {
      if (!this.player) return;
      const sources: Plyr.Source[] = [];
      const tracks: Plyr.Track[] = [];
      movie.streams.forEach(stream => {
        if (stream.codec === this.selectedCodec) {
          sources.push({
            src: stream.src,
            type: stream.mimeType,
            provider: 'html5',
            size: stream.quality
          });
        }
      });
      movie.subtitles.forEach(subtitle => {
        tracks.push({
          kind: 'subtitles',
          label: ISO6391.getName(subtitle.language),
          srcLang: subtitle.language,
          src: subtitle.src
        });
      });
      this.player.source = {
        type: 'video',
        sources: sources,
        tracks: tracks
      };
    });
  }

  ngOnDestroy(): void {
    if (this.player)
      this.player.destroy();
  }

}
