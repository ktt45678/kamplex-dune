import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { of, switchMap, takeUntil, zipWith } from 'rxjs';
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
  sources: Plyr.Source[] = [];
  tracks: Plyr.Track[] = [];
  selectedCodec: number = 1;

  constructor(private ref: ChangeDetectorRef, private meta: Meta, private mediaService: MediaService, private route: ActivatedRoute,
    private translocoService: TranslocoService, private destroyService: DestroyService) { }

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
    this.translocoService.selectTranslation('languages').pipe(switchMap(t => {
      return this.mediaService.findMovieStreams(id).pipe(zipWith(of(t)));
    })).subscribe(([movie, t]) => {
      if (!this.player) return;
      this.sources = [];
      this.tracks = [];
      movie.streams.forEach(stream => {
        if (stream.codec === this.selectedCodec) {
          this.sources.push({
            src: stream.src,
            type: stream.mimeType,
            provider: 'html5',
            size: stream.quality
          });
        }
      });
      movie.subtitles.forEach(subtitle => {
        this.tracks.push({
          kind: 'subtitles',
          label: t[subtitle.language],
          srcLang: subtitle.language,
          src: subtitle.src
        });
      });
      this.player.source = {
        type: 'video',
        sources: this.sources,
        tracks: this.tracks
      };
    });
  }

  ngOnDestroy(): void {
    if (this.player)
      this.player.destroy();
  }

}
