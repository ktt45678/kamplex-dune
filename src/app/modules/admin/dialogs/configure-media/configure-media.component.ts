import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslocoService, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SwiperOptions } from 'swiper';
import { first, of, switchMap, zipWith } from 'rxjs';
import { escape } from 'lodash';

import { MediaSourceStatus, MediaStatus, MediaType } from '../../../../core/enums';
import { MediaDetails, MediaVideo, MediaSubtitle } from '../../../../core/models';
import { MediaService, QueueUploadService } from '../../../../core/services';
import { AddVideoComponent } from '../add-video';
import { AddSubtitleComponent } from '../add-subtitle';
import { UpdateVideoComponent } from '../update-video';
import { AddSourceComponent } from '../add-source';

@Component({
  selector: 'app-configure-media',
  templateUrl: './configure-media.component.html',
  styleUrls: ['./configure-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
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
export class ConfigureMediaComponent implements OnInit {
  MediaType = MediaType;
  MediaStatus = MediaStatus;
  MediaSourceStatus = MediaSourceStatus;
  loadingMedia: boolean = false;
  loadingVideo: boolean = false;
  displayVideo: boolean = false;
  deletingVideo: boolean = false;
  activeVideoIndex: number = 0;
  youtubeUrl = 'https://www.youtube.com/embed/';
  youtubeThumbnailUrl = 'https://img.youtube.com/vi/';
  uploadingSource: boolean = false;
  media?: MediaDetails;

  sideBarItems: MenuItem[] = [];
  swiperConfig: SwiperOptions;

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig, public dialogService: DialogService,
    private confirmationService: ConfirmationService, private mediaService: MediaService,
    private queueUploadService: QueueUploadService, private translocoService: TranslocoService) {
    this.swiperConfig = {
      autoplay: false,
      navigation: {
        prevEl: '#swiper-prev-video',
        nextEl: '#swiper-next-video'
      },
      loop: false,
      pagination: false,
      allowTouchMove: true,
      slidesPerView: 1,
      spaceBetween: 6,
      breakpoints: {
        640: {
          slidesPerView: 2
        },
        768: {
          slidesPerView: 3
        },
        1024: {
          slidesPerView: 5
        }
      }
    };
  }

  ngOnInit(): void {
    this.loadMedia();
    this.checkUploadInQueue();
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

  loadMedia(): void {
    const mediaId = this.config.data['_id'];
    this.loadingMedia = true;
    this.mediaService.findOne(mediaId).subscribe(media => this.media = media).add(() => {
      this.loadingMedia = false;
      this.ref.markForCheck();
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
      this.ref.detectChanges();
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
    dialogRef.onClose.pipe(first()).subscribe((videos: MediaVideo[]) => {
      if (!videos || !this.media) return;
      this.media = { ...this.media, videos };
      this.ref.markForCheck();
    });
    dialogRef.onDestroy.pipe(first()).subscribe(() => {
      this.blockScroll();
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
    dialogRef.onClose.pipe(first()).subscribe((videos: MediaVideo[]) => {
      if (!videos || !this.media) return;
      this.media = { ...this.media, videos };
      this.ref.markForCheck();
    });
    dialogRef.onDestroy.pipe(first()).subscribe(() => {
      this.blockScroll();
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
            this.media = { ...this.media, videos };
          },
          error: () => {
            this.renderer.setProperty(element, 'disabled', false);
          }
        }).add(() => this.ref.markForCheck());
      }
    });
  }

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
    this.queueUploadService.uploadQueue.pipe(first()).subscribe({
      next: (files) => {
        this.uploadingSource = !!files.find(f => f.id === mediaId);
        this.ref.markForCheck();
      }
    });
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
            this.media = { ...this.media, movie: { ...this.media.movie, status: MediaSourceStatus.PENDING } };
          }
        }).add(() => {
          this.renderer.setProperty(element, 'disabled', false);
          this.ref.markForCheck();
        });
      }
    });
  }

  blockScroll(): void {
    this.renderer.addClass(this.document.body, 'p-overflow-hidden');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  trackId(index: number, item: any): any {
    return item?._id;
  }

}
