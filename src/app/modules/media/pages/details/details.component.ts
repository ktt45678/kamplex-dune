import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntil } from 'rxjs';

import { MediaDetails } from '../../../../core/models';
import { MediaService } from '../../../../core/services';
import { DestroyService } from '../../../../core/services';
import { MediaType } from '../../../../core/enums';
import { SITE_NAME, YOUTUBE_EMBED_URL, YOUTUBE_THUMBNAIL_URL } from '../../../../../environments/config';

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
  isMobile: boolean = false;
  displayVideo: boolean = false;
  activeVideoIndex: number = 0;
  youtubeUrl = YOUTUBE_EMBED_URL;
  youtubeThumbnailUrl = YOUTUBE_THUMBNAIL_URL;

  constructor(private ref: ChangeDetectorRef, private title: Title, private meta: Meta, private breakpointObserver: BreakpointObserver,
    private mediaService: MediaService, private route: ActivatedRoute, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroyService)).subscribe(params => {
      const id = params['id'];
      if (!id) return;
      this.loadMedia(id);
    });
    this.breakpointObserver.observe('(min-width: 640px)').pipe(takeUntil(this.destroyService)).subscribe(state => {
      this.isMobile = !state.matches;
      this.ref.markForCheck();
    });
  }

  loadMedia(id: string) {
    this.mediaService.findOne(id).subscribe(media => {
      this.media = media;
      this.title.setTitle(`${media.title} - ${SITE_NAME}`);
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
