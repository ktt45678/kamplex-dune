import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { MediaType } from '../../../../core/enums';
import { MediaDetails } from '../../../../core/models';
import { MediaService } from '../../../../core/services';

@Component({
  selector: 'app-view-media',
  templateUrl: './view-media.component.html',
  styleUrls: ['./view-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    MediaService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media'
    }
  ]
})
export class ViewMediaComponent implements OnInit {
  MediaType = MediaType;
  loadingMedia: boolean = false;
  displayVideo: boolean = false;
  activeVideoIndex: number = 0;
  youtubeUrl = 'https://www.youtube.com/embed/';
  youtubeThumbnailUrl = 'https://img.youtube.com/vi/';
  media?: MediaDetails;

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private mediaService: MediaService) { }

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

  viewVideo(index: number): void {
    this.activeVideoIndex = index;
    this.displayVideo = true;
  }

  addVideo(url: string = 'https://www.youtube.com/watch?v=DvkFSVGKYA0'): void {
    const mediaId = this.config.data['_id'];
  }

  trackId(index: number, item: any): any {
    return item?._id;
  }

}
