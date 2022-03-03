import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { delay } from 'rxjs';
import Swiper, { SwiperOptions } from 'swiper';

import { MediaType } from '../../../../core/enums';
import { MediaDetails, MediaVideo } from '../../../../core/models';
import { MediaService } from '../../../../core/services';

@Component({
  selector: 'app-configure-media',
  templateUrl: './configure-media.component.html',
  styleUrls: ['./configure-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    MediaService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media'
    }
  ]
})
export class ConfigureMediaComponent implements OnInit {
  MediaType = MediaType;
  loadingMedia: boolean = false;
  displayVideo: boolean = false;
  isAddingVideo: boolean = false;
  activeVideoIndex: number = 0;
  youtubeUrl = 'https://www.youtube.com/embed/';
  youtubeThumbnailUrl = 'https://img.youtube.com/vi/';
  media?: MediaDetails;

  addVideoForm: FormGroup;
  swiperConfig: SwiperOptions;

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private confirmationService: ConfirmationService, private mediaService: MediaService) {
    this.addVideoForm = new FormGroup({
      name: new FormControl(''),
      url: new FormControl('', [Validators.required])
    });
    this.swiperConfig = {
      autoplay: false,
      navigation: true,
      loop: false,
      pagination: false,
      allowTouchMove: true,
      slidesPerView: 1,
      spaceBetween: 5,
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
    this.mediaService.findAllVideos(mediaId).subscribe(videos => {
      if (this.media) {
        this.media = { ...this.media, videos };
        this.ref.markForCheck();
      }
    });
  }

  viewVideo(index: number): void {
    this.activeVideoIndex = index;
    this.displayVideo = true;
  }

  onAddVideoFormSubmit(): void {
    const mediaId = this.config.data['_id'];
    this.mediaService.addVideo(mediaId, {
      name: this.addVideoForm.value['name'],
      url: this.addVideoForm.value['url'],
    }).subscribe({
      next: () => this.loadVideos()
    }).add(() => {
      this.addVideoForm.reset();
      this.ref.markForCheck();
    });
  }

  deleteVideo(video: MediaVideo, event: Event) {
    const mediaId = this.config.data['_id'];
    this.confirmationService.confirm({
      key: 'inModal',
      message: `Are you sure you want to delete this video? This action cannot be undone.`,
      header: 'Delete Video',
      icon: 'pi pi-info-circle',
      defaultFocus: 'none',
      accept: () => {
        const element = event.target instanceof HTMLButtonElement ? event.target : <HTMLButtonElement>(<HTMLSpanElement>event.target).parentElement;
        element.disabled = true;
        this.ref.markForCheck();
        this.mediaService.deleteVideo(mediaId, video._id).subscribe({
          next: () => this.loadVideos(),
          error: () => {
            element.disabled = false;
            this.ref.markForCheck();
          }
        });
      }
    });
  }

  onUpdateVideoSwiper(swiper: any) {
    swiper.activeIndex = swiper.activeIndex + 1;
  }

  blockScroll(): void {
    document.body.classList.add('p-overflow-hidden');
  }

  trackId(index: number, item: any): any {
    return item?._id;
  }

}
