import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslocoService, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, first, merge, of, switchMap, takeUntil, takeWhile, tap, zipWith } from 'rxjs';
import { escape, isEqual } from 'lodash';

import { MediaPStatus, MediaSourceStatus, MediaStatus, MediaType, SocketMessage, SocketRoom } from '../../../../core/enums';
import { MediaDetails, MediaVideo, MediaSubtitle, TVEpisode, Genre, Producer } from '../../../../core/models';
import { DestroyService, GenresService, ItemDataService, MediaService, ProducersService, QueueUploadService } from '../../../../core/services';
import { WsService } from '../../../../shared/modules/ws';
import { DropdownOptionDto } from '../../../../core/dto/media';
import { MediaChange, MediaVideoChange } from '../../../../core/interfaces/ws';
import { AddVideoComponent } from '../add-video';
import { UpdateVideoComponent } from '../update-video';
import { CreateEpisodeComponent } from '../create-episode';
import { ConfigureEpisodeComponent } from '../configure-episode';
import { AddSourceComponent } from '../add-source';
import { fileExtension, maxFileSize, shortDate } from '../../../../core/validators';
import { SUBTITLE_UPLOAD_EXT, SUBTITLE_UPLOAD_SIZE } from '../../../../../environments/config';

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
      useValue: 'media',
      multi: true
    },
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'languages',
      multi: true
    }
  ]
})
export class ConfigureMediaComponent implements OnInit, OnDestroy {
  MediaType = MediaType;
  MediaStatus = MediaStatus;
  MediaPStatus = MediaPStatus;
  MediaSourceStatus = MediaSourceStatus;
  loadingMedia: boolean = false;
  loadingVideo: boolean = false;
  displayVideo: boolean = false;
  isDeletingVideo: boolean = false;
  isUpdatingMedia: boolean = false;
  isUpdated: boolean = false;
  isUploadingSource: boolean = false;
  isAddingSubtitle: boolean = false;
  updateMediaFormChanged: boolean = false;
  activeVideoIndex: number = 0;
  youtubeUrl = 'https://www.youtube.com/embed/';
  youtubeThumbnailUrl = 'https://img.youtube.com/vi/';
  media?: MediaDetails;
  addSubtitleLanguages?: DropdownOptionDto[];
  addSubtitleForm: FormGroup;
  updateMediaForm?: FormGroup;
  updateMediaInitValue: any = {};
  days: DropdownOptionDto[] = [];
  months: DropdownOptionDto[] = [];
  years: DropdownOptionDto[] = [];
  languages: DropdownOptionDto[] = [];
  genreSuggestions: Genre[] = [];
  producerSuggestions: Producer[] = [];

  sideBarItems: MenuItem[] = [];

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig, public dialogService: DialogService,
    private confirmationService: ConfirmationService, private mediaService: MediaService, private itemDataService: ItemDataService,
    private genresService: GenresService, private producersService: ProducersService, private queueUploadService: QueueUploadService,
    private wsService: WsService, private translocoService: TranslocoService, private destroyService: DestroyService) {
    const lang = this.translocoService.getActiveLang();
    this.addSubtitleForm = new FormGroup({
      language: new FormControl(lang, [Validators.required]),
      file: new FormControl(null, [Validators.required, maxFileSize(SUBTITLE_UPLOAD_SIZE), fileExtension(SUBTITLE_UPLOAD_EXT)])
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
    this.loadGenreSuggestions();
    this.loadProducerSuggestions();
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
      this.createUpdateMediaForm(media);
      if (media.type === MediaType.MOVIE)
        this.loadSubtitleFormData(media);
    }).add(() => {
      showLoading && (this.loadingMedia = false);
      this.ref.markForCheck();
    });
  }

  loadGenreSuggestions(search?: string): void {
    this.genresService.findGenreSuggestions(search).subscribe({
      next: genres => this.genreSuggestions = genres
    }).add(() => this.ref.markForCheck());
  }

  loadProducerSuggestions(search?: string): void {
    this.producersService.findProducerSuggestions(search).subscribe({
      next: producers => this.producerSuggestions = producers
    }).add(() => this.ref.markForCheck());
  }

  onUpdateMediaFormSubmit(value: any): void {

  }

  onUpdateMediaFormReset(): void {
    if (!this.updateMediaForm) return;
    this.updateMediaForm.reset(this.updateMediaInitValue);
    this.detectFormChange(this.updateMediaForm);
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
      data: this.media,
      width: '700px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    const dialogComponent = this.dialogService.dialogComponentRefMap.get(this.dialogRef)?.instance;
    if (dialogComponent) dialogComponent.unbindGlobalListeners();
    dialogRef.onClose.pipe(first()).subscribe((videos: MediaVideo[]) => {
      if (!videos || !this.media) return;
      this.media = { ...this.media, videos: [...videos] };
      this.ref.markForCheck();
    });
    dialogRef.onDestroy.pipe(first()).subscribe(() => {
      this.blockScroll();
      if (!dialogComponent) return;
      dialogComponent.moveOnTop();
      dialogComponent.bindGlobalListeners();
      dialogComponent.focus();
    });
  }

  showUpdateVideoDialog(video: MediaVideo): void {
    if (!this.media) return;
    const dialogRef = this.dialogService.open(UpdateVideoComponent, {
      data: { media: this.media, video },
      width: '700px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    const dialogComponent = this.dialogService.dialogComponentRefMap.get(this.dialogRef)?.instance;
    if (dialogComponent) dialogComponent.unbindGlobalListeners();
    dialogRef.onClose.pipe(first()).subscribe((videos: MediaVideo[]) => {
      if (!videos || !this.media) return;
      this.media = { ...this.media, videos };
      this.ref.markForCheck();
    });
    dialogRef.onDestroy.pipe(first()).subscribe(() => {
      this.blockScroll();
      if (!dialogComponent) return;
      dialogComponent.moveOnTop();
      dialogComponent.bindGlobalListeners();
      dialogComponent.focus();
    });
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
        this.ref.markForCheck();
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

  /*
  showAddSubtitleDialog(): void {
    if (!this.media) return;
    const dialogRef = this.dialogService.open(AddSubtitleComponent, {
      data: this.media,
      width: '500px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    dialogRef.onClose.pipe(first()).subscribe((subtitles: MediaSubtitle[]) => {
      if (!subtitles || !this.media) return;
      this.media = { ...this.media, movie: { ...this.media.movie, subtitles } };
      this.ref.markForCheck();
    });
    dialogRef.onDestroy.pipe(first()).subscribe(() => {
      this.blockScroll();
    });
  }
  */

  onAddSubtitleFormSubmit(): void {
    if (this.addSubtitleForm.invalid) return;
    this.isAddingSubtitle = true;
    const mediaId = this.config.data._id;
    const language = this.addSubtitleForm.value['language'];
    this.mediaService.addMovieSubtitle(mediaId, {
      language: language,
      file: this.addSubtitleForm.value['file']
    }).subscribe({
      next: subtitles => {
        if (!subtitles || !this.media) return;
        this.media = { ...this.media, movie: { ...this.media.movie, subtitles } };
        this.disableSubtitleLanguage(language, true);
        this.addSubtitleForm.reset();
      }
    }).add(() => {
      this.isAddingSubtitle = false;
      this.ref.markForCheck();
    });
  }

  addSubtitleToForm(file: File): void {
    const fileControl = this.addSubtitleForm.get('file');
    if (!fileControl) return;
    fileControl.setValue(file);
    if (!fileControl.touched)
      fileControl.markAsTouched();
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
        this.ref.markForCheck();
        this.mediaService.deleteMovieSubtitle(mediaId, subtitle._id).subscribe({
          next: () => {
            if (!this.media) return;
            const subtitles = this.media.movie.subtitles.filter(v => v._id !== subtitle._id);
            this.media = { ...this.media, movie: { ...this.media.movie, subtitles } };
            this.disableSubtitleLanguage(subtitle.language, false);
          },
          error: () => {
            this.renderer.setProperty(element, 'disabled', false);
          }
        }).add(() => this.ref.markForCheck());
      }
    });
  }

  showAddSourceDialog(): void {
    if (!this.media) return;
    const dialogRef = this.dialogService.open(AddSourceComponent, {
      data: this.media,
      width: '500px',
      modal: true,
      dismissableMask: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    //dialogRef.onClose.pipe(first()).subscribe() => {
    //});
    dialogRef.onDestroy.pipe(first()).subscribe(() => {
      this.blockScroll();
    });
  }

  checkUploadInQueue(): void {
    const mediaId = this.config.data._id;
    this.isUploadingSource = this.queueUploadService.isMediaInQueue(mediaId);
    this.ref.markForCheck();
  }

  uploadSource(file: File): void {
    const mediaId = this.config.data._id;
    this.queueUploadService.addToQueue(mediaId, file, `media/${mediaId}/movie/source`, `media/${mediaId}/movie/source/:id`);
    this.checkUploadInQueue();
  }

  deleteSource(event: Event): void {
    const mediaId = this.config.data['_id'];
    const safeMediaTitle = escape(this.config.data['title']);
    this.confirmationService.confirm({
      key: 'inModal',
      message: this.translocoService.translate('admin.media.deleteSourceConfirmation', { name: safeMediaTitle }),
      header: this.translocoService.translate('admin.media.deleteSourceConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => {
        const element = event.target instanceof HTMLButtonElement ? event.target : <HTMLButtonElement>(<HTMLSpanElement>event.target).parentElement;
        this.renderer.setProperty(element, 'disabled', true);
        this.ref.markForCheck();
        this.mediaService.deleteMovieSource(mediaId).subscribe({
          next: () => {
            if (!this.media) return;
            this.media = { ...this.media, movie: { ...this.media.movie, status: MediaSourceStatus.PENDING }, pStatus: MediaPStatus.PENDING };
            this.isUpdated = true;
          }
        }).add(() => {
          this.renderer.setProperty(element, 'disabled', false);
          this.ref.markForCheck();
        });
      }
    });
  }

  showCreateEpisodeDialog(): void {
    if (!this.media) return;
    const dialogRef = this.dialogService.open(CreateEpisodeComponent, {
      data: this.media,
      width: '768px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem', 'overflow-y': 'hidden', 'padding': '0px' }
    });
    // Fix nested dialog focus
    const dialogComponent = this.dialogService.dialogComponentRefMap.get(this.dialogRef)?.instance;
    if (dialogComponent) dialogComponent.unbindGlobalListeners();
    dialogRef.onClose.pipe(first()).subscribe((episode) => {
      if (!episode || !this.media) return;
      this.media = {
        ...this.media,
        tv: {
          lastAirDate: this.media.tv.lastAirDate,
          episodeCount: this.media.tv.episodeCount + 1,
          episodes: [...this.media.tv.episodes, { ...episode }]
        }
      };
      this.isUpdated = true;
      this.ref.markForCheck();
    });
    dialogRef.onDestroy.pipe(first()).subscribe(() => {
      this.blockScroll();
      // Fix nested dialog focus
      if (!dialogComponent) return;
      dialogComponent.moveOnTop();
      dialogComponent.bindGlobalListeners();
      dialogComponent.focus();
    });
  }

  showConfigureEpisodeDialog(episode: TVEpisode): void {
    if (!this.media) return;
    const dialogRef = this.dialogService.open(ConfigureEpisodeComponent, {
      data: { media: this.media, episode },
      width: '1280px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    // Fix nested dialog focus
    const dialogComponent = this.dialogService.dialogComponentRefMap.get(this.dialogRef)?.instance;
    if (dialogComponent) dialogComponent.unbindGlobalListeners();
    dialogRef.onClose.pipe(first()).subscribe((episode) => {
      if (!episode || !this.media) return;
      this.media = {
        ...this.media,
        tv: {
          lastAirDate: this.media.tv.lastAirDate,
          episodeCount: this.media.tv.episodeCount,
          episodes: [...this.media.tv.episodes]
        }
      };
      this.ref.markForCheck();
    });
    dialogRef.onDestroy.pipe(first()).subscribe(() => {
      this.blockScroll();
      // Fix nested dialog focus
      if (!dialogComponent) return;
      dialogComponent.moveOnTop();
      dialogComponent.bindGlobalListeners();
      dialogComponent.focus();
    });
  }

  loadTranslations(): void {
    this.translocoService.selectTranslation('media').pipe(switchMap(t2 => {
      return this.translocoService.selectTranslation('admin').pipe(zipWith(of(t2)));
    }), first()).subscribe(([t1, t2]) => {
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

  loadSubtitleFormData(media: MediaDetails): void {
    const disabledLanguages = media.movie.subtitles.map((s: MediaSubtitle) => s.language);
    this.itemDataService.createLanguageList(disabledLanguages).pipe(first()).subscribe({
      next: languages => this.addSubtitleLanguages = languages
    });
  }

  disableSubtitleLanguage(language: string, disabled: boolean): void {
    if (!this.addSubtitleLanguages) return;
    const index = this.addSubtitleLanguages.findIndex(s => s.value === language);
    if (index < 0) return;
    this.addSubtitleLanguages[index].disabled = disabled;
  }

  createUpdateMediaForm(media: MediaDetails): void {
    this.updateMediaForm = new FormGroup({
      title: new FormControl(media.title, Validators.maxLength(500)),
      originalTitle: new FormControl(media.originalTitle, Validators.maxLength(500)),
      overview: new FormControl(media.overview, [Validators.minLength(10), Validators.maxLength(2000)]),
      originalLanguage: new FormControl(media.originalLanguage),
      genres: new FormControl(media.genres),
      producers: new FormControl(media.producers),
      runtime: new FormControl(media.runtime),
      adult: new FormControl(media.adult),
      releaseDateDay: new FormControl(media.releaseDate.day),
      releaseDateMonth: new FormControl(media.releaseDate.month),
      releaseDateYear: new FormControl(media.releaseDate.year),
      lastAirDateDay: new FormControl(null),
      lastAirDateMonth: new FormControl(null),
      lastAirDateYear: new FormControl(null),
      visibility: new FormControl(media.visibility),
      status: new FormControl(media.status)
    }, {
      validators: shortDate('releaseDateDay', 'releaseDateMonth', 'releaseDateYear', true)
    });
    if (media.type === MediaType.TV) {
      this.updateMediaForm.addControl('lastAirDateDay', new FormControl());
      this.updateMediaForm.addControl('lastAirDateMonth', new FormControl());
      this.updateMediaForm.addControl('lastAirDateYear', new FormControl());
      this.updateMediaForm.addValidators(shortDate('lastAirDateDay', 'lastAirDateMonth', 'lastAirDateYear', false));
      this.updateMediaForm.patchValue({
        lastAirDateDay: media.tv.lastAirDate.day,
        lastAirDateMonth: media.tv.lastAirDate.month,
        lastAirDateYear: media.tv.lastAirDate.year
      });
    }
    this.updateMediaInitValue = this.updateMediaForm.value;
    this.detectFormChange(this.updateMediaForm);
  }

  detectFormChange(updateMediaForm: FormGroup): void {
    this.updateMediaFormChanged = false;
    updateMediaForm.valueChanges.pipe(
      takeWhile((value) => isEqual(value, this.updateMediaInitValue)),
      finalize(() => {
        this.updateMediaFormChanged = true;
        this.ref.markForCheck();
      })
    ).subscribe();
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
