import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { Subscription, combineLatest, filter, first, interval, map, of, switchMap, takeUntil, timer } from 'rxjs';

import { UpdateWatchTimeDto } from '../../../../core/dto/history';
import { AuthService, MediaService, HistoryService, RatingsService, DestroyService } from '../../../../core/services';
import { MediaDetails, MediaStream, Rating, TVEpisode, UserDetails } from '../../../../core/models';
import { VideoPlayerComponent } from '../../../../shared/components/video-player';
import { StarRatingComponent } from '../../../../shared/components/star-rating';
import { MediaBreakpoints, MediaType } from '../../../../core/enums';
import { toHexColor } from '../../../../core/utils';
import { SITE_NAME, SITE_THEME_COLOR } from '../../../../../environments/config';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HistoryService, RatingsService, DestroyService]
})
export class WatchComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer?: VideoPlayerComponent;
  @ViewChild('starRating') set _starRating(value: StarRatingComponent) {
    this.starRating = value;
    if (!this.userRating) return;
    this.starRating.setRating(this.userRating.score / 2);
  };
  starRating?: StarRatingComponent;
  MediaType = MediaType;
  loading: boolean = false;
  currentUser!: UserDetails | null;
  playerPreviewThumbnail?: string;
  selectedCodec: number = 1;
  media?: MediaDetails;
  episodes?: TVEpisode[];
  streams?: MediaStream;
  userRating?: Rating;
  ratingAverage: number = 0;
  ratingScore: number = 0;
  ratingCount: number = 0;
  showingMore: boolean = false;
  autoNext: boolean = false;
  canFitWindow: boolean = true;
  fitWindow: boolean = false;
  loadingRating: boolean = false;
  prevEpIndex: number = -1;
  nextEpIndex: number = -1;
  watchTimeUpdateSub: Subscription = new Subscription();

  constructor(private ref: ChangeDetectorRef, private title: Title, private meta: Meta, private breakpointObserver: BreakpointObserver,
    private authService: AuthService, private mediaService: MediaService, private historyService: HistoryService,
    private ratingsService: RatingsService, private route: ActivatedRoute, private router: Router,
    private translocoService: TranslocoService, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.initWatch();
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      this.currentUser = user;
      this.initWatchTimeUpdater();
      this.ref.markForCheck();
    });
    this.breakpointObserver.observe(MediaBreakpoints.MEDIUM_2).pipe(takeUntil(this.destroyService)).subscribe(state => {
      this.canFitWindow = state.matches;
      this.ref.markForCheck();
    });
  }

  initWatch(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      map(([params, queryParams]) => ({ id: params.get('id'), epNumber: queryParams.get('ep') })),
      filter((params): params is { id: string, epNumber: string | null } => params.id !== null),
      switchMap(params => {
        // Unset current source and start loading
        this.streams = undefined;
        this.loading = true;
        this.ref.markForCheck();
        if (params.id === this.media?._id) return of(this.media).pipe(map(media => ({ media, params })));
        return this.mediaService.findOne(params.id).pipe(map(media => ({ media, params })));
      }),
      takeUntil(this.destroyService)
    ).subscribe(({ media, params }) => {
      if (this.media?._id !== media._id)
        this.findMediaRating(media);
      // Assign media
      this.media = media;
      this.ratingCount = media.ratingCount;
      this.ratingScore = media.ratingScore;
      this.ratingAverage = media.ratingAverage;
      // Start watching
      if (media.type === MediaType.MOVIE) {
        this.watchMovie(media);
      }
      else if (media.type === MediaType.TV) {
        if (!media.tv.episodes.length) return;
        this.episodes = media.tv.episodes;
        // Play first episode by default
        if (!params.epNumber) {
          const ep = media.tv.episodes[0].epNumber;
          this.router.navigate([], { queryParams: { ep }, replaceUrl: true });
          return;
        }
        this.watchTVEpisode(media, params.epNumber);
      }
    }).add(() => {
      this.loading = false;
      this.ref.markForCheck();
    });
  }

  initWatchTimeUpdater(): void {
    this.watchTimeUpdateSub.unsubscribe();
    if (this.currentUser?.settings?.history.paused) return;
    this.watchTimeUpdateSub.add(
      interval(3000).pipe(takeUntil(this.destroyService)).subscribe(() => {
        this.updateLocalWatchTime();
      })
    );
    if (this.currentUser) {
      this.watchTimeUpdateSub.add(
        timer(5000, 60000).pipe(takeUntil(this.destroyService)).subscribe(() => {
          this.updateWatchTimeToServer();
        })
      );
    }
  }

  updateLocalWatchTime() {
    if (this.media && this.videoPlayer?.player) {
      const updateWatchTimeDto: UpdateWatchTimeDto = {
        media: this.media._id,
        time: ~~this.videoPlayer.player.currentTime
      };
      if (this.streams?.episode)
        updateWatchTimeDto.episode = this.streams.episode._id;
      this.historyService.updateLocal(updateWatchTimeDto);
    }
  }

  updateWatchTimeToServer() {
    if (!this.currentUser) return;
    this.historyService.updateToServer();
  }

  watchMovie(media: MediaDetails): void {
    this.title.setTitle(`${media.title} - ${SITE_NAME}`);
    this.setMediaMeta(media);
    this.mediaService.findMovieStreams(media._id).subscribe(movieStreams => {
      this.streams = movieStreams;
      this.ref.markForCheck();
    });
  }

  watchTVEpisode(media: MediaDetails, epNumber: string | number): void {
    epNumber = Number(epNumber);
    if (this.media && media._id === this.media._id && this.streams?.episode
      && this.streams.episode.epNumber === epNumber) return;
    this.translocoService.selectTranslation('media').pipe(first()).subscribe(t => {
      this.title.setTitle(`${media.title} ${t['episode.episodePrefix']} ${epNumber} - ${SITE_NAME}`);
    });
    this.setMediaMeta(media);
    this.findPrevAndNextEpisodes(media.tv.episodes, epNumber);
    this.mediaService.findTVStreams(media._id, epNumber).subscribe(episodeStreams => {
      this.streams = episodeStreams;
      this.ref.markForCheck();
    });
  }

  findPrevAndNextEpisodes(episodes: TVEpisode[], epNumber: number): void {
    this.prevEpIndex = episodes.findIndex(e => e.epNumber === epNumber - 1);
    this.nextEpIndex = episodes.findIndex(e => e.epNumber === epNumber + 1);
  }

  changeEpisode(episodeIndex: number): void {
    if (!this.episodes) return;
    const ep = this.episodes[episodeIndex].epNumber;
    this.router.navigate([], { queryParams: { ep } });
  }

  toggleFitWindow(event: boolean): void {
    this.fitWindow = event;
  }

  setMediaMeta(media: MediaDetails): void {
    this.meta.updateTag({ name: 'description', content: media.overview });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:title', content: media.title });
    this.meta.updateTag({ property: 'og:description', content: media.overview });
    media.posterColor && this.meta.updateTag({ name: 'theme-color', content: toHexColor(media.posterColor) });
    if (media.posterUrl) {
      this.meta.updateTag({ property: 'og:image', content: media.posterUrl });
      this.meta.updateTag({ property: 'og:image:url', content: media.posterUrl });
      this.meta.updateTag({ property: 'og:image:secure_url', content: media.posterUrl });
      this.meta.updateTag({ property: 'og:image:width', content: '500' });
      this.meta.updateTag({ property: 'og:image:height', content: '750' });
      this.meta.updateTag({ property: 'og:image:type', content: 'image/jpeg' });
      this.meta.updateTag({ property: 'og:image:alt', content: media.title });
    }
  }

  findMediaRating(media: MediaDetails): void {
    if (!this.authService.currentUser) return;
    this.ratingsService.findMedia({ media: media._id }).subscribe({
      next: (rating) => {
        if (!rating) return;
        this.userRating = rating;
        this.starRating?.setRating(rating.score / 2);
        this.ref.markForCheck();
      }
    });
  }

  onRating(ratingScore: number | null): void {
    if (!this.media) return;
    this.loadingRating = true;
    this.ratingsService.create({
      media: this.media._id,
      score: ratingScore !== null ? ratingScore * 2 : null
    }).subscribe({
      next: (rating) => {
        // Update client side rating
        let score = rating.score;
        if (!this.userRating) {
          this.ratingCount += 1;
        } else {
          score -= this.userRating.score;
        }
        this.ratingScore += score;
        this.ratingAverage = this.ratingScore / this.ratingCount;
        this.userRating = rating;
        this.ref.markForCheck();
      }
    }).add(() => {
      this.loadingRating = false;
    });
  }

  deleteRating(): void {
    if (!this.userRating) return;
    this.loadingRating = true;
    this.ratingsService.remove(this.userRating._id).subscribe(() => {
      const oldScore = this.userRating!.score;
      this.ratingCount -= 1;
      this.ratingScore -= oldScore;
      this.ratingAverage = this.ratingCount ? this.ratingScore / this.ratingCount : 0;
      this.userRating = undefined;
      this.ref.markForCheck();
    }).add(() => {
      this.loadingRating = false;
    });
  }

  ngOnDestroy(): void {
    this.title.setTitle(SITE_NAME);
    this.meta.removeTag('name="description"');
    this.meta.removeTag('property="og:site_name"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:image"');
    this.meta.removeTag('property="og:image:url"');
    this.meta.removeTag('property="og:image:secure_url"');
    this.meta.removeTag('property="og:image:width"');
    this.meta.removeTag('property="og:image:height"');
    this.meta.removeTag('property="og:image:type"');
    this.meta.removeTag('property="og:image:alt"');
    this.meta.updateTag({ name: 'theme-color', content: SITE_THEME_COLOR });
    this.currentUser && this.updateWatchTimeToServer();
  }
}
