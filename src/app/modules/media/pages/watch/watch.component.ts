import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { combineLatest, filter, finalize, first, map, of, switchMap, takeUntil } from 'rxjs';
import { SourceInfo, Source, Track } from 'plyr';

import { AuthService, MediaService, RatingsService } from '../../../../core/services';
import { DestroyService } from '../../../../core/services';
import { ExtStreamList, MediaDetails, MediaStream, Rating, TVEpisode, UserDetails } from '../../../../core/models';
import { MediaType } from '../../../../core/enums';
import { SITE_NAME } from '../../../../../environments/config';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RatingsService, DestroyService]
})
export class WatchComponent implements OnInit, OnDestroy {
  MediaType = MediaType;
  loading: boolean = false;
  currentUser!: UserDetails | null;
  playerSource?: SourceInfo;
  playerHlsSource?: ExtStreamList;
  selectedCodec: number = 1;
  media?: MediaDetails;
  episodes?: TVEpisode[];
  streams?: MediaStream;
  userRating?: Rating;
  showingMore: boolean = false;
  autoNext: boolean = false;
  prevEpIndex: number = -1;
  nextEpIndex: number = -1;

  constructor(private ref: ChangeDetectorRef, private title: Title, private meta: Meta, private authService: AuthService,
    private mediaService: MediaService, private ratingsService: RatingsService, private route: ActivatedRoute,
    private router: Router, private translocoService: TranslocoService, private destroyService: DestroyService) { }

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      map(([params, queryParams]) => ({ id: params.get('id'), episodeNumber: queryParams.get('ep') })),
      filter((params): params is { id: string, episodeNumber: string | null } => params.id !== null),
      switchMap(params => {
        if (params.id === this.media?._id) return of(this.media).pipe(map(media => ({ media, params })));
        this.loading = true;
        return this.mediaService.findOne(params.id).pipe(map(media => ({ media, params })));
      }),
      takeUntil(this.destroyService)
    ).subscribe(({ media, params }) => {
      if (this.media?._id !== media._id)
        this.findMediaRating(media);

      this.media = media;

      if (media.type === MediaType.MOVIE) {
        this.watchMovie(media);
      }
      else if (media.type === MediaType.TV) {
        if (!media.tv.episodes.length) return;
        this.episodes = media.tv.episodes;
        // Play first episode by default
        if (!params.episodeNumber) {
          const ep = media.tv.episodes[0].episodeNumber;
          this.router.navigate([], { queryParams: { ep }, replaceUrl: true });
          return;
        }
        this.watchTVEpisode(media, params.episodeNumber);
      }
    }).add(() => {
      this.loading = false;
      this.ref.markForCheck();
    });
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      this.currentUser = user;
      this.ref.markForCheck();
    });
  }

  watchMovie(media: MediaDetails): void {
    this.title.setTitle(`${media.title} - ${SITE_NAME}`);
    this.setMediaMeta(media.title);
    this.translocoService.selectTranslation('languages').pipe(first(), switchMap(languages => {
      return this.mediaService.findMovieStreams(media._id).pipe(map(movieStreams => ({ movieStreams, languages })));
    })).subscribe(({ movieStreams, languages }) => {
      this.streams = movieStreams;
      this.ref.markForCheck();
      this.setPlayerSource(movieStreams, languages);
    });
  }

  watchTVEpisode(media: MediaDetails, episodeNumber: string | number): void {
    episodeNumber = Number(episodeNumber);
    if (this.media && media._id === this.media._id && this.streams?.episode
      && this.streams.episode.episodeNumber === episodeNumber) return;
    this.translocoService.selectTranslation('media').pipe(first()).subscribe(t => {
      this.title.setTitle(`${t['episode.unnamedEpisode']} ${episodeNumber} - ${media.title} - ${SITE_NAME}`);
    });
    this.setMediaMeta(media.title);
    this.findPrevAndNextEpisodes(media.tv.episodes, episodeNumber);
    this.translocoService.selectTranslation('languages').pipe(first(), switchMap(languages => {
      return this.mediaService.findTVStreams(media._id, episodeNumber).pipe(map(episodeStreams => ({ episodeStreams, languages })));
    })).subscribe(({ episodeStreams, languages }) => {
      this.streams = episodeStreams;
      this.ref.markForCheck();
      this.setPlayerSource(episodeStreams, languages);
    });
  }

  findPrevAndNextEpisodes(episodes: TVEpisode[], episodeNumber: number): void {
    this.prevEpIndex = episodes.findIndex(e => e.episodeNumber === episodeNumber - 1);
    this.nextEpIndex = episodes.findIndex(e => e.episodeNumber === episodeNumber + 1);
  }

  changeEpisode(episodeIndex: number): void {
    if (!this.episodes) return;
    const ep = this.episodes[episodeIndex].episodeNumber;
    this.router.navigate([], { queryParams: { ep } });
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
    data.streams?.forEach(file => {
      if (file.codec === this.selectedCodec) {
        sources.push({
          src: file.src,
          type: file.mimeType,
          provider: 'html5',
          size: file.quality
        });
      }
    });
    data.subtitles?.forEach(subtitle => {
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
    this.playerHlsSource = data.extStreamList;
    this.ref.markForCheck();
  }

  findMediaRating(media: MediaDetails): void {
    this.ratingsService.findMedia({ media: media._id }).subscribe({
      next: (rating) => {
        if (!rating) return;
        this.userRating = rating;
        this.ref.markForCheck();
      }
    });
  }

  onRating(rating: number | null): void {
    if (!this.media) return;
    this.ratingsService.create({
      media: this.media._id,
      score: rating !== null ? rating * 2 : null
    }).subscribe({
      next: (rating) => {
        this.userRating = rating;
        this.ref.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.meta.removeTag('name="description"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
  }
}
