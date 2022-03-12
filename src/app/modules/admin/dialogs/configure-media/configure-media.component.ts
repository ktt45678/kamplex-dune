import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { first } from 'rxjs';
import { SwiperOptions } from 'swiper';

import { MediaStatus, MediaType } from '../../../../core/enums';
import { MediaDetails, MediaVideo, MediaSubtitle } from '../../../../core/models';
import { MediaService } from '../../../../core/services';
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
  loadingMedia: boolean = false;
  loadingVideo: boolean = false;
  displayVideo: boolean = false;
  deletingVideo: boolean = false;
  activeVideoIndex: number = 0;
  youtubeUrl = 'https://www.youtube.com/embed/';
  youtubeThumbnailUrl = 'https://img.youtube.com/vi/';
  media?: MediaDetails;

  swiperConfig: SwiperOptions;

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig, public dialogService: DialogService,
    private confirmationService: ConfirmationService, private mediaService: MediaService) {
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
          slidesPerView: 4
        }
      }
    };
  }

  ngOnInit(): void {
    this.loadMedia();
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
      message: `Are you sure you want to delete this video? This action cannot be undone.`,
      header: 'Delete Video',
      icon: 'pi pi-info-circle',
      defaultFocus: 'none',
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
      message: `Are you sure you want to delete this subtitle? This action cannot be undone.`,
      header: 'Delete Subtitle',
      icon: 'pi pi-info-circle',
      defaultFocus: 'none',
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
