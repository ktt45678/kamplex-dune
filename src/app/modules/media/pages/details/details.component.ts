import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs';
import { StateChange } from 'ng-lazyload-image';

import { MediaDetails } from '../../../../core/models';
import { MediaService } from '../../../../core/services';
import { DestroyService } from '../../../../core/services';
import { MediaType } from '../../../../core/enums';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class DetailsComponent implements OnInit {
  MediaType = MediaType;
  media?: MediaDetails;
  displayVideo: boolean = false;
  activeVideoIndex: number = 0;
  youtubeUrl = 'https://www.youtube.com/embed/';
  youtubeThumbnailUrl = 'https://img.youtube.com/vi/';

  constructor(private ref: ChangeDetectorRef, private meta: Meta, private mediaService: MediaService, private route: ActivatedRoute, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroyService)).subscribe(params => {
      const id = params['id'];
      if (!id) return;
      this.loadMedia(id);
    });
  }

  loadMedia(id: string) {
    this.mediaService.findOne(id).subscribe(media => {
      this.media = media;
      this.meta.addTags([
        {
          name: 'description',
          content: 'View details on KamPlex'
        },
        {
          property: 'og:site_name',
          content: 'KamPlex'
        },
        {
          property: 'og:title',
          content: media.title
        },
        {
          property: 'og:description',
          content: 'View details on KamPlex'
        }
      ]);
      this.ref.markForCheck();
    });
  }

  viewVideo(index: number) {
    this.activeVideoIndex = index;
    this.displayVideo = true;
  }

  trackId(index: number, item: any): any {
    return item?._id || null;
  }

}
