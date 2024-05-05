import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription, combineLatest, filter, first, interval, map, of, switchMap, takeUntil, timer } from 'rxjs';

import { UpdateWatchTimeDto } from '../../../../core/dto/history';
import { AuthService, MediaService, HistoryService, RatingsService, DestroyService } from '../../../../core/services';
import { CursorPaginated, Media, MediaDetails, MediaStream, Rating, TVEpisode, UserDetails } from '../../../../core/models';
import { VideoPlayerComponent } from '../../../../shared/components/video-player';
import { StarRatingComponent } from '../../../../shared/components/star-rating';
import { AddToPlaylistComponent } from '../../../../shared/dialogs/add-to-playlist';
import { ShareMediaLinkComponent, SharingOption } from '../../../../shared/dialogs/share-media-link';
import { MediaBreakpoints, MediaType } from '../../../../core/enums';
import { toHexColor, trackId } from '../../../../core/utils';
import { SITE_NAME, SITE_THEME_COLOR } from '../../../../../environments/config';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HistoryService, RatingsService, DestroyService]
})
export class WatchComponent implements OnInit, OnDestroy {
  track_Id = trackId;
  @ViewChild('videoPlayer') videoPlayer?: VideoPlayerComponent;
  @ViewChild('starRating') set _starRating(value: StarRatingComponent) {
    this.starRating = value;
    if (!this.userRating) return;
    this.starRating.setRating(this.userRating.score / 2);
  };
  starRating?: StarRatingComponent;
  MediaType = MediaType;
  loading: boolean = false;
  loadingMoreRelatedMedia: boolean = false;
  currentUser!: UserDetails | null;
  playerPreviewThumbnail?: string;
  media?: MediaDetails;
  relatedMediaList?: CursorPaginated<Media>;
  episodes?: TVEpisode[];
  streams?: MediaStream;
  userRating?: Rating;
  initPlayTime: number = 0;
  ratingAverage: number = 0;
  ratingScore: number = 0;
  ratingCount: number = 0;
  showMoreDetails: boolean = false;
  autoNext: boolean = false;
  canFitWindow: boolean = true;
  fitWindow: boolean = false;
  loadingRating: boolean = false;
  prevEpIndex: number = -1;
  nextEpIndex: number = -1;
  relatedMediaLimit: number = 20;
  watchTimeUpdateSub?: Subscription;
  serverWatchTimeUpdateSub?: Subscription;

  constructor(private ref: ChangeDetectorRef, private title: Title, private meta: Meta, private location: Location,
    private breakpointObserver: BreakpointObserver, private dialogService: DialogService, private authService: AuthService,
    private mediaService: MediaService, private historyService: HistoryService, private ratingsService: RatingsService,
    private route: ActivatedRoute, private router: Router, private translocoService: TranslocoService,
    private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.initWatch();
    this.initWatchTimeUpdater();
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      this.currentUser = user;
      this.initServerWatchTimeUpdater();
      this.ref.markForCheck();
    });
    this.breakpointObserver.observe(MediaBreakpoints.MEDIUM_2).pipe(takeUntil(this.destroyService)).subscribe(state => {
      this.canFitWindow = state.matches;
      this.ref.markForCheck();
    });
  }

  initWatch(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      map(([params, queryParams]) => ({ id: params.get('id'), epNumber: queryParams.get('ep'), time: Number(queryParams.get('t')) })),
      filter((params): params is { id: string, epNumber: string | null, time: number } => params.id !== null),
      switchMap(params => {
        // Unset current source and start loading
        this.streams = undefined;
        this.initPlayTime = params.time;
        this.loading = true;
        this.ref.markForCheck();
        if (params.id === this.media?._id) return of(this.media).pipe(map(media => ({ media, params })));
        const mediaId = params.id.split('-')[0];
        return this.mediaService.findOne(mediaId).pipe(map(media => ({ media, params })));
      }),
      takeUntil(this.destroyService)
    ).subscribe({
      next: ({ media, params }) => {
        if (this.media?._id !== media._id)
          this.findMediaRating(media);
        // Assign media
        this.media = media;
        this.ratingCount = media.ratingCount;
        this.ratingScore = media.ratingScore;
        this.ratingAverage = media.ratingAverage;
        // Find relasted media list
        this.findRelatedMedia(true);
        // Start watching
        if (media.type === MediaType.MOVIE) {
          const replacedUrlParams = new URLSearchParams({ ...this.route.snapshot.queryParams }).toString();
          this.location.replaceState('/watch/' + media._id + '-' + media.slug.substring(0, 100), replacedUrlParams);
          this.watchMovie(media);
        } else if (media.type === MediaType.TV) {
          if (!media.tv.episodes.length) return;
          this.episodes = media.tv.episodes;
          // Play first episode by default
          if (!params.epNumber) {
            const ep = media.tv.episodes[0].epNumber;
            const replacedUrlParams = new URLSearchParams({ ...this.route.snapshot.queryParams, ep: ep.toString() }).toString();
            this.location.replaceState('/watch/' + media._id + '-' + media.slug.substring(0, 100), replacedUrlParams);
            this.watchTVEpisode(media, ep);
            return;
          }
          this.watchTVEpisode(media, params.epNumber);
        }
        this.loading = false;
        this.ref.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.ref.markForCheck();
      }
    });
  }

  initWatchTimeUpdater(): void {
    if (this.watchTimeUpdateSub && !this.watchTimeUpdateSub.closed)
      this.watchTimeUpdateSub.unsubscribe();
    this.watchTimeUpdateSub = interval(2000).subscribe(() => {
      this.updateLocalWatchTime();
    });
  }

  initServerWatchTimeUpdater(): void {
    if (this.currentUser) {
      if (this.currentUser.settings?.history.paused) {
        this.watchTimeUpdateSub?.unsubscribe();
        return
      };
      if (this.serverWatchTimeUpdateSub && !this.serverWatchTimeUpdateSub.closed)
        this.serverWatchTimeUpdateSub.unsubscribe();
      this.serverWatchTimeUpdateSub = timer(5000, 60000).subscribe(() => {
        this.updateWatchTimeToServer();
      });
    }
  }

  updateLocalWatchTime() {
    if (!this.loading && this.media && this.videoPlayer?.player) {
      const updateWatchTimeDto: UpdateWatchTimeDto = {
        media: this.media._id,
        time: ~~(this.videoPlayer.player()?.currentTime || 0)
      };
      if (this.streams?.episode)
        updateWatchTimeDto.episode = this.streams.episode._id;
      this.historyService.updateLocal(updateWatchTimeDto);
    }
  }

  updateWatchTimeToServer() {
    if (!this.currentUser || this.loading) return;
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

  showAddToPlaylistDialog() {
    if (!this.media) return;
    if (!this.authService.currentUser) {
      this.router.navigate(['/sign-in'], { queryParams: { continue: `/details/${this.media._id}` } });
      return;
    }
    this.dialogService.open(AddToPlaylistComponent, {
      data: { ...this.media },
      header: this.translocoService.translate('media.playlists.addToPlaylists'),
      width: '320px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm'
    });
  }

  showShareMediaLinkDialog() {
    if (!this.media) return;
    const currentTimeUrl = new URL(window.location.href);
    currentTimeUrl.searchParams.append('t', Math.trunc(this.videoPlayer?.playerStore().currentTime || 0).toString());
    const sharingOptions: SharingOption[] = [{
      label: this.translocoService.translate('media.sharing.url'),
      content: window.location.href,
      type: 'url'
    }, {
      label: this.translocoService.translate('media.sharing.currentTimeUrl'),
      content: currentTimeUrl.toString(),
      type: 'url'
    }];
    this.dialogService.open(ShareMediaLinkComponent, {
      data: sharingOptions,
      header: this.translocoService.translate('media.sharing.shareMedia'),
      width: '500px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm'
    });
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

  findRelatedMedia(resetList: boolean, pageToken?: string): void {
    if (!this.media) return;
    const tagIds = this.media.tags.map(t => t._id);
    if (!tagIds.length) return;
    this.loadingMoreRelatedMedia = true;
    this.mediaService.findPageCursor({
      pageToken,
      limit: this.relatedMediaLimit,
      preset: 'related',
      presetParams: this.media._id
    }).subscribe(mediaList => {
      this.appendRelatedMedia(mediaList, resetList);
    }).add(() => {
      this.loadingMoreRelatedMedia = false;
      this.ref.markForCheck();
    });
  }

  appendRelatedMedia(newList: CursorPaginated<Media>, resetList?: boolean): void {
    if (!this.relatedMediaList || resetList) {
      this.relatedMediaList = newList;
      return;
    }
    this.relatedMediaList = {
      hasNextPage: newList.hasNextPage,
      nextPageToken: newList.nextPageToken,
      prevPageToken: newList.prevPageToken,
      totalResults: newList.totalResults,
      results: [...this.relatedMediaList.results, ...newList.results]
    };
  }

  toggleShowMoreDetails(): void {
    this.showMoreDetails = !this.showMoreDetails;
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
    this.watchTimeUpdateSub?.unsubscribe();
    this.serverWatchTimeUpdateSub?.unsubscribe();
  }
}
