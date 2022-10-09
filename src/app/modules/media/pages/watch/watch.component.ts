import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { combineLatest, filter, map, switchMap, takeUntil } from 'rxjs';
import { SourceInfo, Source, Track } from 'plyr';

import { MediaService } from '../../../../core/services';
import { DestroyService } from '../../../../core/services';
import { MediaDetails, MediaStream, TVEpisode } from '../../../../core/models';
import { MediaType } from '../../../../core/enums';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class WatchComponent implements OnInit, OnDestroy {
  MediaType = MediaType;
  loading: boolean = false;
  playerSource?: SourceInfo;
  selectedCodec: number = 1;
  media?: MediaDetails;
  episodes?: TVEpisode[];

  constructor(private ref: ChangeDetectorRef, private meta: Meta, private mediaService: MediaService, private route: ActivatedRoute,
    private translocoService: TranslocoService, private destroyService: DestroyService) { }

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        map(([params, queryParams]) => ({ id: params.get('id'), episodeNumber: queryParams.get('ep') })),
        filter((params): params is { id: string, episodeNumber: string | null } => params.id !== null),
        switchMap(params => {
          this.loading = true;
          return this.mediaService.findOne(params.id).pipe(map(media => ({ media, params })));
        }),
        takeUntil(this.destroyService)
      )
      .subscribe(({ media, params }) => {
        this.media = media;
        if (media.type === MediaType.MOVIE) {
          this.watchMovie(media);
        }
        else if (media.type === MediaType.TV) {
          this.episodes = media.tv.episodes;
          this.watchTVEpisode(media, params.episodeNumber);
        }
      }).add(() => {
        this.loading = false;
        this.ref.markForCheck();
      });
  }

  watchMovie(media: MediaDetails): void {
    this.setMediaMeta(media.title);
    this.translocoService.selectTranslation('languages').pipe(switchMap(languages => {
      return this.mediaService.findMovieStreams(media._id).pipe(map(movie => ({ movie, languages })));
    })).subscribe(({ movie, languages }) => {
      this.setPlayerSource(movie, languages)
    });
  }

  watchTVEpisode(media: MediaDetails, episodeNumber: string | number | null): void {
    this.setMediaMeta(media.title);
    if (!episodeNumber && !media.tv.episodes.length) return;
    this.translocoService.selectTranslation('languages').pipe(switchMap(languages => {
      episodeNumber = episodeNumber || media.tv.episodes[0].episodeNumber;
      return this.mediaService.findTVStreams(media._id, episodeNumber).pipe(map(episode => ({ episode, languages })));
    })).subscribe(({ episode, languages }) => {
      this.setPlayerSource(episode, languages)
    });
  }

  setMediaMeta(title: string): void {
    this.meta.addTags([
      {
        name: 'description',
        content: 'Watch on KamPlex'
      },
      {
        property: 'og:title',
        content: title
      },
      {
        property: 'og:description',
        content: 'Watch on KamPlex'
      }
    ], true);
  }

  setPlayerSource(data: MediaStream, languages: Translation): void {
    const sources: Source[] = [];
    const tracks: Track[] = [];
    data.streams.forEach(file => {
      if (file.codec === this.selectedCodec) {
        sources.push({
          src: file.src,
          type: file.mimeType,
          provider: 'html5',
          size: file.quality
        });
      }
    });
    data.subtitles.forEach(subtitle => {
      tracks.push({
        kind: 'subtitles',
        label: languages[subtitle.language],
        srcLang: subtitle.language,
        src: subtitle.src
      });
    });
    this.playerSource = {
      type: 'video',
      sources: sources,
      tracks: tracks
    };
    this.ref.markForCheck();
  }

  ngOnDestroy(): void {
    this.meta.removeTag('name="description"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
  }
}
