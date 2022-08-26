import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2, Inject, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslocoService, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Menu } from 'primeng/menu';
import { first, map, merge, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { cloneDeep } from 'lodash';
import { SourceInfo, Source, Track } from 'plyr';

import { MediaDetails, MediaVideo, MediaSubtitle, TVEpisode, Genre, Production } from '../../../../core/models';
import { DestroyService, GenresService, ItemDataService, MediaService, ProductionsService, QueueUploadService } from '../../../../core/services';
import { WsService } from '../../../../shared/modules/ws';
import { DropdownOptionDto, UpdateMediaDto } from '../../../../core/dto/media';
import { MediaChange, MediaVideoChange } from '../../../../core/interfaces/ws';
import { DataMenuItem } from '../../../../core/interfaces/primeng';
import { AddVideoComponent } from '../add-video';
import { UpdateVideoComponent } from '../update-video';
import { AddSubtitleComponent } from '../add-subtitle';
import { CreateEpisodeComponent } from '../create-episode';
import { ConfigureEpisodeComponent } from '../configure-episode';
import { AddSourceComponent } from '../add-source';
import { FileUploadComponent } from '../../../../shared/components/file-upload';
import { fileExtension, maxFileSize, shortDate } from '../../../../core/validators';
import { AddSubtitleForm, ShortDateForm } from '../../../../core/interfaces/forms';
import { ExtStreamSelected } from '../../../../core/interfaces/events';
import { ImageEditorComponent } from '../../../../shared/dialogs/image-editor';
import { dataURItoBlob, detectFormChange, translocoEscape, fixNestedDialogFocus, replaceDialogHideMethod } from '../../../../core/utils';
import { AppErrorCode, MediaPStatus, MediaSourceStatus, MediaStatus, MediaType, SocketMessage, SocketRoom } from '../../../../core/enums';
import {
  UPLOAD_SUBTITLE_EXT, UPLOAD_SUBTITLE_SIZE, YOUTUBE_EMBED_URL, YOUTUBE_THUMBNAIL_URL, IMAGE_PREVIEW_SIZE, UPLOAD_POSTER_SIZE,
  UPLOAD_BACKDROP_SIZE, UPLOAD_POSTER_MIN_WIDTH, UPLOAD_POSTER_MIN_HEIGHT, UPLOAD_BACKDROP_MIN_WIDTH,
  UPLOAD_BACKDROP_MIN_HEIGHT, UPLOAD_POSTER_ASPECT_WIDTH, UPLOAD_POSTER_ASPECT_HEIGHT, UPLOAD_BACKDROP_ASPECT_WIDTH,
  UPLOAD_BACKDROP_ASPECT_HEIGHT
} from '../../../../../environments/config';

interface UpdateMediaForm {
  title: FormControl<string>;
  originalTitle: FormControl<string | null>;
  overview: FormControl<string>;
  originalLanguage: FormControl<string | null>;
  genres: FormControl<Genre[] | null>;
  productions: FormControl<Production[] | null>;
  runtime: FormControl<number | null>;
  adult: FormControl<boolean>;
  releaseDate: FormGroup<ShortDateForm>;
  lastAirDate?: FormGroup<ShortDateForm>;
  visibility: FormControl<number>;
  status: FormControl<string>;
}

@Component({
  selector: 'app-configure-media',
  templateUrl: './configure-media.component.html',
  styleUrls: ['./configure-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    ItemDataService,
    DestroyService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'languages'
    }
  ]
})
export class ConfigureMediaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('subtitleFileUpload') subtitleFileUpload?: FileUploadComponent;
  MediaType = MediaType;
  MediaStatus = MediaStatus;
  MediaSourceStatus = MediaSourceStatus;
  loadingMedia: boolean = false;
  loadingVideo: boolean = false;
  loadingEpisodes: boolean = false;
  displayVideo: boolean = false;
  isDeletingVideo: boolean = false;
  isUpdatingMedia: boolean = false;
  isUpdatingPoster: boolean = false;
  isUpdatingBackdrop: boolean = false;
  isUploadingSource: boolean = false;
  isAddingSubtitle: boolean = false;
  isLoadedAllEpisodes: boolean = false;
  isUpdated: boolean = false;
  updateMediaFormChanged: boolean = false;
  showMoviePlayer: boolean = false;
  activeVideoIndex: number = 0;
  youtubeUrl = YOUTUBE_EMBED_URL;
  youtubeThumbnailUrl = YOUTUBE_THUMBNAIL_URL;
  media?: MediaDetails;
  episodes?: TVEpisode[];
  previewSource?: SourceInfo;
  addSubtitleForm: FormGroup<AddSubtitleForm>;
  updateMediaForm: FormGroup<UpdateMediaForm>;
  updateMediaInitValue: {} = {};
  posterPreviewName?: string;
  backdropPreviewName?: string;
  posterPreviewUri?: string;
  backdropPreviewUri?: string;
  days: DropdownOptionDto[] = [];
  months: DropdownOptionDto[] = [];
  years: DropdownOptionDto[] = [];
  languages: DropdownOptionDto[] = [];
  genreSuggestions: Genre[] = [];
  productionSuggestions: Production[] = [];
  sideBarItems: MenuItem[] = [];
  episodeMenuItems: DataMenuItem<TVEpisode>[] = [];

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig, private dialogService: DialogService,
    private confirmationService: ConfirmationService, private mediaService: MediaService,
    private itemDataService: ItemDataService, private genresService: GenresService, private productionsService: ProductionsService,
    private queueUploadService: QueueUploadService, private wsService: WsService, private translocoService: TranslocoService,
    private destroyService: DestroyService) {
    const mediaType = this.config.data['type'] || MediaType.MOVIE;
    const lang = this.translocoService.getActiveLang();
    this.updateMediaForm = new FormGroup<UpdateMediaForm>({
      title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] }),
      originalTitle: new FormControl('', [Validators.maxLength(500)]),
      overview: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(2000)] }),
      originalLanguage: new FormControl(''),
      genres: new FormControl(null),
      productions: new FormControl(null),
      runtime: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(10000)]),
      adult: new FormControl(false, { nonNullable: true, validators: Validators.required }),
      releaseDate: new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, { validators: shortDate('day', 'month', 'year', true) }),
      visibility: new FormControl(1, { nonNullable: true, validators: Validators.required }),
      status: new FormControl(MediaStatus.RELEASED, { nonNullable: true, validators: Validators.required })
    });
    if (mediaType === MediaType.TV) {
      this.updateMediaForm.addControl('lastAirDate', new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, { validators: shortDate('day', 'month', 'year', false) }));
    }
    this.addSubtitleForm = new FormGroup<AddSubtitleForm>({
      language: new FormControl(lang, Validators.required),
      file: new FormControl(null, [Validators.required, maxFileSize(UPLOAD_SUBTITLE_SIZE), fileExtension(UPLOAD_SUBTITLE_EXT)])
    });
  }

  ngOnInit(): void {
    this.loadMedia();
    this.checkUploadInQueue();
    this.loadTranslations();
    this.initSocket();
    this.days = this.itemDataService.createDateList();
    this.months = this.itemDataService.createMonthList();
    this.years = this.itemDataService.createYearList();
    this.itemDataService.createLanguageList().pipe(first()).subscribe(languages => this.languages = languages);
  }

  initSocket(): void {
    const mediaId = this.config.data['_id'];
    const connect$ = this.wsService.fromEvent('connect').pipe(tap(() => {
      this.wsService.joinRoom(`${SocketRoom.ADMIN_MEDIA_DETAILS}:${mediaId}`);
    }));
    const refreshMedia$ = this.wsService.fromEvent<MediaChange>(SocketMessage.REFRESH_MEDIA).pipe(tap(() => this.loadMedia(false)));
    const refreshMediaVideos$ = this.wsService.fromEvent<MediaVideoChange>(SocketMessage.REFRESH_MEDIA_VIDEOS)
      .pipe(tap(data => this.updateMediaVideos(data.videos)));
    const refreshMovieSubtitles$ = this.wsService.fromEvent<MediaVideoChange>(SocketMessage.REFRESH_MOVIE_SUBTITLES)
      .pipe(tap(data => this.updateMediaVideos(data.videos)));
    const mediaProcessingSuccess$ = this.wsService.fromEvent<MediaChange>(SocketMessage.MEDIA_PROCESSING_SUCCESS)
      .pipe(tap(() => this.updateMovieSourceStatus(MediaSourceStatus.DONE)));
    const mediaProcessingFailure$ = this.wsService.fromEvent<MediaChange>(SocketMessage.MEDIA_PROCESSING_FAILURE)
      .pipe(tap(() => this.updateMovieSourceStatus(MediaSourceStatus.PENDING)));
    const deleteMovieSource$ = this.wsService.fromEvent<MediaChange>(SocketMessage.DELETE_MOVIE_SOURCE)
      .pipe(tap(() => this.updateMovieSourceStatus(MediaSourceStatus.PENDING)));
    merge(connect$, refreshMedia$, refreshMediaVideos$, refreshMovieSubtitles$, mediaProcessingSuccess$,
      mediaProcessingFailure$, deleteMovieSource$)
      .pipe(takeUntil(this.destroyService)).subscribe();
  }

  ngAfterViewInit(): void {
    replaceDialogHideMethod(this.dialogService, () => {
      this.closeDialog();
    }, this.dialogRef);
  }

  updateMovieSourceStatus(status: MediaSourceStatus): void {
    if (!this.media) return;
    this.media = { ...this.media, movie: { ...this.media.movie, status } };
    this.ref.markForCheck();
  }

  updateMediaVideos(videos: MediaVideo[]): void {
    if (!this.media) return;
    this.media = { ...this.media, videos };
    this.ref.markForCheck();
  }

  updateMediaSubtitles(subtitles: MediaSubtitle[]): void {
    if (!this.media) return;
    this.media = { ...this.media, movie: { ...this.media.movie, subtitles } };
    this.ref.markForCheck();
  }

  loadMedia(showLoading: boolean = true): void {
    if (!this.config.data) return;
    const mediaId = this.config.data['_id'];
    showLoading && (this.loadingMedia = true);
    this.mediaService.findOne(mediaId).subscribe(media => {
      this.media = media;
      if (media.type === MediaType.TV) {
        this.episodes = media.tv.episodes;
        if (media.tv.episodes.length >= media.tv.episodeCount)
          this.isLoadedAllEpisodes = true;
      }
      this.patchUpdateMediaForm(media);
    }).add(() => {
      showLoading && (this.loadingMedia = false);
      this.ref.markForCheck();
    });
  }

  loadEpisodes(showLoading: boolean = true, options: { limited: boolean } = { limited: false }): void {
    const mediaType = this.config.data['type'];
    if (mediaType !== MediaType.TV) return;
    const mediaId = this.config.data['_id'];
    showLoading && (this.loadingEpisodes = true);
    this.mediaService.findAllTVEpisodes(mediaId, {
      includeHidden: true,
      includeUnprocessed: true,
      limited: options.limited
    }).subscribe(episodes => {
      this.episodes = episodes;
      showLoading && (this.loadingEpisodes = false);
      this.ref.markForCheck();
    });
  }

  loadGenreSuggestions(search?: string): void {
    this.genresService.findGenreSuggestions(search).subscribe({
      next: genres => this.genreSuggestions = genres
    }).add(() => this.ref.markForCheck());
  }

  loadProductionSuggestions(search?: string): void {
    this.productionsService.findProductionSuggestions(search).subscribe({
      next: productions => this.productionSuggestions = productions
    }).add(() => this.ref.markForCheck());
  }

  onUpdateMediaFormSubmit(): void {
    if (!this.media || this.updateMediaForm.invalid) return;
    this.isUpdatingMedia = true;
    const mediaId = this.config.data['_id'];
    const formValue = this.updateMediaForm.getRawValue();
    const genreIds = formValue.genres?.map(g => g._id) || [];
    const productionIds = formValue.productions?.map(p => p._id) || [];
    const updateMediaDto: UpdateMediaDto = {
      title: formValue.title,
      originalTitle: formValue.originalTitle || null,
      overview: formValue.overview,
      genres: genreIds,
      originalLanguage: formValue.originalLanguage,
      productions: productionIds,
      runtime: formValue.runtime!,
      adult: formValue.adult,
      releaseDate: {
        day: formValue.releaseDate.day!,
        month: formValue.releaseDate.month!,
        year: formValue.releaseDate.year!
      },
      visibility: formValue.visibility,
      status: formValue.status
    };
    if (this.media.type === MediaType.TV && formValue.lastAirDate) {
      if (formValue.lastAirDate.day && formValue.lastAirDate.month && formValue.lastAirDate.year) {
        updateMediaDto.lastAirDate = {
          day: formValue.lastAirDate.day,
          month: formValue.lastAirDate.month,
          year: formValue.lastAirDate.year
        }
      } else {
        updateMediaDto.lastAirDate = null;
      }
    }
    this.mediaService.update(mediaId, updateMediaDto).pipe(takeUntil(this.destroyService)).subscribe(media => {
      this.media = media;
      this.detectUpdateMediaFormChange();
      this.isUpdated = true;
    }).add(() => {
      this.isUpdatingMedia = false;
      this.ref.markForCheck();
    });
  }

  onUpdateMediaFormReset(): void {
    this.updateMediaForm.reset(this.updateMediaInitValue);
    this.detectUpdateMediaFormChange();
  }

  onInputPosterChange(event: Event): void {
    const element = <HTMLInputElement>event.target;
    if (!element.files?.length || !this.media) return;
    if (element.files[0].size > IMAGE_PREVIEW_SIZE)
      throw new Error(AppErrorCode.UPLOAD_POSTER_TOO_LARGE);
    this.editImage({
      aspectRatioWidth: UPLOAD_POSTER_ASPECT_WIDTH, aspectRatioHeight: UPLOAD_POSTER_ASPECT_HEIGHT,
      minWidth: UPLOAD_POSTER_MIN_WIDTH, minHeight: UPLOAD_POSTER_MIN_HEIGHT,
      imageFile: element.files[0], maxSize: UPLOAD_POSTER_SIZE
    }).subscribe(result => {
      if (!result) return;
      const [previewUri, name] = result;
      this.posterPreviewName = name;
      this.posterPreviewUri = previewUri;
      this.ref.markForCheck();
    });
  }

  onInputBackdropChange(event: Event): void {
    const element = <HTMLInputElement>event.target;
    if (!element.files?.length || !this.media) return;
    if (element.files[0].size > IMAGE_PREVIEW_SIZE)
      throw new Error(AppErrorCode.UPLOAD_BACKDROP_TOO_LARGE);
    this.editImage({
      aspectRatioWidth: UPLOAD_BACKDROP_ASPECT_WIDTH, aspectRatioHeight: UPLOAD_BACKDROP_ASPECT_HEIGHT,
      minWidth: UPLOAD_BACKDROP_MIN_WIDTH, minHeight: UPLOAD_BACKDROP_MIN_HEIGHT,
      imageFile: element.files[0], maxSize: UPLOAD_BACKDROP_SIZE
    }).subscribe(result => {
      if (!result) return;
      const [previewUri, name] = result;
      this.backdropPreviewName = name;
      this.backdropPreviewUri = previewUri;
      this.ref.markForCheck();
    });
  }

  editImage(data: any): Observable<string[] | null> {
    const dialogRef = this.dialogService.open(ImageEditorComponent, {
      data: data,
      header: this.translocoService.translate('admin.configureMedia.editImage'),
      width: '700px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm'
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
    return dialogRef.onClose.pipe(first());
  }

  onUpdatePosterSubmit(): void {
    if (!this.posterPreviewName) return;
    this.isUpdatingPoster = true;
    const mediaId = this.config.data['_id'];
    const posterBlob = dataURItoBlob(this.posterPreviewUri!);
    this.mediaService.uploadPoster(mediaId, posterBlob, this.posterPreviewName).subscribe({
      next: (paritalMedia) => {
        this.posterPreviewName = undefined;
        this.posterPreviewUri = undefined;
        if (!this.media) return;
        this.media = { ...this.media, ...paritalMedia };
        this.isUpdated = true;
      }
    }).add(() => {
      this.isUpdatingPoster = false;
      this.ref.markForCheck();
    });
  }

  onUpdateBackdropSubmit(): void {
    if (!this.backdropPreviewName) return;
    this.isUpdatingBackdrop = true;
    const mediaId = this.config.data['_id'];
    const backdropBlob = dataURItoBlob(this.backdropPreviewUri!);
    this.mediaService.uploadBackdrop(mediaId, backdropBlob, this.backdropPreviewName).subscribe({
      next: (paritalMedia) => {
        this.backdropPreviewName = undefined;
        this.backdropPreviewUri = undefined;
        if (!this.media) return;
        this.media = { ...this.media, ...paritalMedia };
      }
    }).add(() => {
      this.isUpdatingBackdrop = false;
      this.ref.markForCheck();
    });
  }

  onUpdatePosterCancel(): void {
    this.posterPreviewName = undefined;
    this.posterPreviewUri = undefined;
    this.ref.markForCheck();
  }

  onUpdateBackdropCancel(): void {
    this.backdropPreviewName = undefined;
    this.backdropPreviewUri = undefined;
    this.ref.markForCheck();
  }

  deletePoster(event: Event): void {
    const mediaId = this.config.data['_id'];
    const safeMediaTitle = translocoEscape(this.config.data['title']);
    this.confirmationService.confirm({
      key: 'inModal',
      message: this.translocoService.translate('admin.media.deletePosterConfirmation', { name: safeMediaTitle }),
      header: this.translocoService.translate('admin.media.deletePosterConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => {
        const element = event.target instanceof HTMLButtonElement ? event.target : <HTMLButtonElement>(<HTMLSpanElement>event.target).parentElement;
        this.renderer.setProperty(element, 'disabled', true);
        this.mediaService.deletePoster(mediaId).subscribe({
          next: () => {
            if (!this.media) return;
            this.media = {
              ...this.media, posterUrl: undefined, thumbnailPosterUrl: undefined, smallPosterUrl: undefined, fullPosterUrl: undefined,
              posterColor: undefined
            };
            this.isUpdated = true;
          },
          error: () => {
            this.renderer.setProperty(element, 'disabled', false);
          }
        }).add(() => this.ref.markForCheck());
      }
    });
  }

  deleteBackdrop(event: Event): void {
    const mediaId = this.config.data['_id'];
    const safeMediaTitle = translocoEscape(this.config.data['title']);
    this.confirmationService.confirm({
      key: 'inModal',
      message: this.translocoService.translate('admin.media.deleteBackdropConfirmation', { name: safeMediaTitle }),
      header: this.translocoService.translate('admin.media.deleteBackdropConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => {
        const element = event.target instanceof HTMLButtonElement ? event.target : <HTMLButtonElement>(<HTMLSpanElement>event.target).parentElement;
        this.renderer.setProperty(element, 'disabled', true);
        this.mediaService.deleteBackdrop(mediaId).subscribe({
          next: () => {
            if (!this.media) return;
            this.media = {
              ...this.media, backdropUrl: undefined, thumbnailBackdropUrl: undefined, smallBackdropUrl: undefined,
              fullBackdropUrl: undefined, backdropColor: undefined
            };
          },
          error: () => {
            this.renderer.setProperty(element, 'disabled', false);
          }
        }).add(() => this.ref.markForCheck());
      }
    });
  }

  loadVideos(): void {
    const mediaId = this.config.data['_id'];
    this.loadingVideo = true;
    this.mediaService.findAllVideos(mediaId).subscribe(videos => {
      if (!this.media) return;
      this.media = { ...this.media, videos };
    }).add(() => {
      this.loadingVideo = false;
      this.ref.markForCheck();
    });
  }

  viewVideo(index: number): void {
    if (this.loadingVideo) return;
    this.activeVideoIndex = index;
    this.displayVideo = true;
  }

  showAddVideoDialog(): void {
    if (!this.media) return;
    const dialogRef = this.dialogService.open(AddVideoComponent, {
      data: { ...this.media },
      width: '700px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    dialogRef.onClose.pipe(first()).subscribe((videos: MediaVideo[]) => {
      if (!videos || !this.media) return;
      this.media = { ...this.media, videos: [...videos] };
      this.ref.markForCheck();
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  showUpdateVideoDialog(video: MediaVideo): void {
    if (!this.media) return;
    const dialogRef = this.dialogService.open(UpdateVideoComponent, {
      data: { media: { ...this.media }, video: { ...video } },
      width: '700px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    dialogRef.onClose.pipe(first()).subscribe((videos: MediaVideo[]) => {
      if (!videos || !this.media) return;
      this.media = { ...this.media, videos };
      this.ref.markForCheck();
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  deleteVideo(video: MediaVideo, event: Event): void {
    const mediaId = this.config.data['_id'];
    this.confirmationService.confirm({
      key: 'inModal',
      message: this.translocoService.translate('admin.media.deleteVideoConfirmation'),
      header: this.translocoService.translate('admin.media.deleteVideoConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => {
        const element = event.target instanceof HTMLButtonElement ? event.target : <HTMLButtonElement>(<HTMLSpanElement>event.target).parentElement;
        this.renderer.setProperty(element, 'disabled', true);
        this.mediaService.deleteVideo(mediaId, video._id).subscribe({
          next: () => {
            if (!this.media) return;
            const videos = this.media.videos.filter(v => v._id !== video._id);
            this.media = { ...this.media, videos: [...videos] };
          },
          error: () => {
            this.renderer.setProperty(element, 'disabled', false);
          }
        }).add(() => this.ref.markForCheck());
      }
    });
  }

  showAddSubtitleDialog(file?: File, episode?: TVEpisode): void {
    if (!this.media) return;
    if (file && file.size > UPLOAD_SUBTITLE_SIZE)
      throw new Error(AppErrorCode.UPLOAD_SUBTITLE_TOO_LARGE);
    this.subtitleFileUpload?.clear();
    const dialogRef = this.dialogService.open(AddSubtitleComponent, {
      data: { media: { ...this.media }, episode: episode ? { ...episode } : undefined, file: file },
      width: '500px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    dialogRef.onClose.pipe(first()).subscribe((subtitles: MediaSubtitle[]) => {
      if (!subtitles || !this.media) return;
      this.media = { ...this.media, movie: { ...this.media.movie, subtitles } };
      this.ref.markForCheck();
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  onAddSubtitleFormCancel(): void {
    this.addSubtitleForm.reset();
  }

  deleteSubtitle(subtitle: MediaSubtitle, event: Event): void {
    const mediaId = this.config.data['_id'];
    this.confirmationService.confirm({
      key: 'inModal',
      message: this.translocoService.translate('admin.media.deleteSubtitleConfirmation'),
      header: this.translocoService.translate('admin.media.deleteSubtitleConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => {
        const element = event.target instanceof HTMLButtonElement ? event.target : <HTMLButtonElement>(<HTMLSpanElement>event.target).parentElement;
        this.renderer.setProperty(element, 'disabled', true);
        this.mediaService.deleteMovieSubtitle(mediaId, subtitle._id).subscribe({
          next: () => {
            if (!this.media) return;
            const subtitles = this.media.movie.subtitles.filter(v => v._id !== subtitle._id);
            this.media = { ...this.media, movie: { ...this.media.movie, subtitles } };
          },
          error: () => {
            this.renderer.setProperty(element, 'disabled', false);
          }
        }).add(() => this.ref.markForCheck());
      }
    });
  }

  showAddSourceDialog(episode?: TVEpisode): void {
    if (!this.media) return;
    const dialogRef = this.dialogService.open(AddSourceComponent, {
      data: { media: { ...this.media }, episode: episode ? { ...episode } : undefined },
      width: '500px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    //dialogRef.onClose.pipe(first()).subscribe() => {
    //});
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  checkUploadInQueue(): void {
    const mediaId = this.config.data['_id'];
    this.isUploadingSource = this.queueUploadService.isMediaInQueue(mediaId);
  }

  uploadSource(file: File): void {
    const mediaId = this.config.data['_id'];
    this.queueUploadService.addToQueue(mediaId, file, `media/${mediaId}/movie/source`, `media/${mediaId}/movie/source/:id`);
    this.isUploadingSource = true;
  }

  showSourcePreview(): void {
    this.showMoviePlayer = true;
    const mediaId = this.config.data['_id'];
    this.translocoService.selectTranslation('languages').pipe(switchMap(t => {
      return this.mediaService.findMovieStreams(mediaId).pipe(map(movie => ({ movie, t })));
    })).subscribe(({ movie, t }) => {
      const sources: Source[] = [];
      const tracks: Track[] = [];
      const selectedCodec = 1;
      movie.streams.forEach(stream => {
        if (stream.codec === selectedCodec) {
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
      this.previewSource = {
        type: 'video',
        sources: sources,
        tracks: tracks
      };
    });
  }

  deleteSource(event: Event): void {
    const mediaId = this.config.data['_id'];
    const safeMediaTitle = translocoEscape(this.config.data['title']);
    this.confirmationService.confirm({
      key: 'inModal',
      message: this.translocoService.translate('admin.media.deleteSourceConfirmation', { name: safeMediaTitle }),
      header: this.translocoService.translate('admin.media.deleteSourceConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => {
        const element = event.target instanceof HTMLButtonElement ? event.target : <HTMLButtonElement>(<HTMLSpanElement>event.target).parentElement;
        this.renderer.setProperty(element, 'disabled', true);
        this.mediaService.deleteMovieSource(mediaId).subscribe({
          next: () => {
            if (!this.media) return;
            this.media.movie.status = MediaSourceStatus.PENDING;
            this.media.pStatus = MediaPStatus.PENDING;
            this.isUpdated = true;
          }
        }).add(() => {
          this.renderer.setProperty(element, 'disabled', false);
          this.ref.markForCheck();
        });
      }
    });
  }

  updateExtStreams(event: ExtStreamSelected): void {
    const mediaId = this.config.data['_id'];
    this.mediaService.update(mediaId, { extStreams: event.streams }).subscribe({
      next: () => event.complete()
    });
  }

  showCreateEpisodeDialog(): void {
    if (!this.media || !this.episodes) return;
    const dialogRef = this.dialogService.open(CreateEpisodeComponent, {
      data: { media: { ...this.media }, episodes: [...this.episodes] },
      width: '980px',
      height: '100%',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem', 'overflow-y': 'hidden', 'padding': '0px' }
    });
    dialogRef.onClose.pipe(first()).subscribe((episode) => {
      if (!episode || !this.episodes) return;
      this.episodes.push(episode);
      this.isUpdated = true;
      this.ref.markForCheck();
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  showConfigureEpisodeDialog(episode: TVEpisode): void {
    if (!this.media) return;
    const dialogRef = this.dialogService.open(ConfigureEpisodeComponent, {
      data: { media: { ...this.media }, episode: { ...episode } },
      width: '1280px',
      modal: true,
      showHeader: false,
      dismissableMask: false,
      contentStyle: { 'padding': 0, 'overflow-y': 'hidden' }
    });
    dialogRef.onClose.pipe(first()).subscribe((updated) => {
      if (!updated || !this.media) return;
      this.loadEpisodes(true, { limited: !this.isLoadedAllEpisodes });
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  showDeleteEpisodeDialog(episode: TVEpisode): void {
    this.confirmationService.confirm({
      key: 'inModal',
      message: this.translocoService.translate('admin.media.deleteEpisodeConfirmation', { episodeNumber: episode.episodeNumber }),
      header: this.translocoService.translate('admin.media.deleteEpisodeConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => this.deleteEpisode(episode)
    });
  }

  deleteEpisode(episode: TVEpisode): void {
    const mediaId = this.config.data['_id'];
    this.mediaService.deleteTVEpisode(mediaId, episode._id).subscribe({
      next: () => this.loadEpisodes(true, { limited: !this.isLoadedAllEpisodes })
    }).add(() => this.ref.markForCheck());
  }

  toggleEpisodeMenu(menu: Menu, event: Event, episode: TVEpisode): void {
    if (!menu.visible) {
      this.createEpisodeMenuItem(episode).subscribe({
        next: (menuItems) => {
          this.episodeMenuItems = menuItems;
          menu.toggle(event);
        }
      });
      return;
    }
    menu.toggle(event);
  }

  createEpisodeMenuItem(episode: TVEpisode): Observable<DataMenuItem<TVEpisode>[]> {
    const mediaId = this.config.data['_id'];
    return this.translocoService.selectTranslation('admin').pipe(map(t => {
      const menuItems: DataMenuItem<TVEpisode>[] = [];
      menuItems.push(
        {
          label: t['configureMedia.addSubtitle'],
          data: episode,
          command: (event) => this.showAddSubtitleDialog(undefined, event.item.data)
        },
        {
          label: t['configureMedia.addSource'],
          data: episode,
          disabled: episode.status !== MediaSourceStatus.PENDING || this.queueUploadService.isMediaInQueue(`${mediaId}:${episode._id}`),
          command: (event) => this.showAddSourceDialog(event.item.data)
        },
        { separator: true },
        {
          label: t['configureMedia.deleteEpisode'],
          icon: 'ms ms-delete',
          data: episode,
          disabled: episode.status === MediaPStatus.PROCESSING,
          command: (event) => this.showDeleteEpisodeDialog(event.item.data)
        }
      );
      return menuItems;
    }), first());
  }

  loadAllEpisodes(): void {
    this.loadEpisodes();
    this.isLoadedAllEpisodes = true;
  }

  loadTranslations(): void {
    this.translocoService.selectTranslation('media').pipe(switchMap(t2 => {
      return this.translocoService.selectTranslation('admin').pipe(map(t1 => ({ t1, t2 })));
    }), first()).subscribe(({ t1, t2 }) => {
      this.sideBarItems = [
        {
          label: t1['configureMedia.general']
        },
        {
          label: t1['configureMedia.images']
        },
        {
          label: t2['details.videos']
        },
        {
          label: t1['configureMedia.subtitles']
        },
        {
          label: t1['configureMedia.source']
        }
      ];
    });
  }

  patchUpdateMediaForm(media: MediaDetails): void {
    this.updateMediaForm.patchValue({
      title: media.title,
      originalTitle: media.originalTitle || '',
      overview: media.overview,
      originalLanguage: media.originalLanguage || null,
      genres: media.genres,
      productions: media.productions,
      runtime: media.runtime,
      adult: media.adult,
      releaseDate: {
        day: media.releaseDate.day,
        month: media.releaseDate.month,
        year: media.releaseDate.year
      },
      visibility: media.visibility,
      status: media.status
    });
    if (media.type === MediaType.TV) {
      this.updateMediaForm.patchValue({
        lastAirDate: {
          day: media.tv.lastAirDate?.day,
          month: media.tv.lastAirDate?.month,
          year: media.tv.lastAirDate?.year
        }
      });
    }
    this.updateMediaInitValue = cloneDeep(this.updateMediaForm.value);
    this.detectUpdateMediaFormChange();
  }

  detectUpdateMediaFormChange(): void {
    detectFormChange(this.updateMediaForm, this.updateMediaInitValue, () => {
      this.updateMediaFormChanged = false;
    }, () => {
      this.updateMediaFormChanged = true;
    }).pipe(takeUntil(this.destroyService)).subscribe();
  }

  blockScroll(): void {
    this.renderer.addClass(this.document.body, 'p-overflow-hidden');
  }

  closeDialog(): void {
    this.dialogRef.close(this.isUpdated);
  }

  trackId(index: number, item: any): any {
    return item?._id;
  }

  ngOnDestroy(): void {
    const mediaId = this.config.data['_id'];
    this.wsService.leaveRoom(`${SocketRoom.ADMIN_MEDIA_DETAILS}:${mediaId}`);
  }

}
