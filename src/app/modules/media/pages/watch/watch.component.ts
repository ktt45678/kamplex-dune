import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { map, switchMap, takeUntil } from 'rxjs';
import { SourceInfo, Source, Track } from 'plyr';

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
  playerSource?: SourceInfo;
  selectedCodec: number = 1;

  constructor(private ref: ChangeDetectorRef, private meta: Meta, private mediaService: MediaService, private route: ActivatedRoute,
    private translocoService: TranslocoService, private destroyService: DestroyService) { }

  ngOnInit(): void {
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
      return this.mediaService.findMovieStreams(id).pipe(map(movie => ({ movie, t })));
    })).subscribe(({ movie, t }) => {
      const sources: Source[] = [];
      const tracks: Track[] = [];
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
          label: t[subtitle.language],
          srcLang: subtitle.language,
          src: subtitle.src
        });
      });
      this.playerSource = {
        type: 'video',
        sources: sources,
        tracks: tracks
      };
    });
  }

  ngOnDestroy(): void {
    this.meta.removeTag('name="description"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
  }
}
