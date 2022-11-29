import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { withCache } from '@ngneat/cashew';

import { Media, Paginated } from '../../../../core/models';
import { MediaService } from '../../../../core/services';
import { CacheKey } from '../../../../core/enums';
import { concat, tap } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  loadingFeaturedMedia: boolean = false;
  loadingMediaList: boolean = false;
  loadingMediaTop: boolean = false;
  featuredMedia?: Media[];
  latestMedia?: Paginated<Media>;
  mostViewedMedia?: Paginated<Media>;
  topRatedMedia?: Paginated<Media>;

  constructor(private ref: ChangeDetectorRef, private meta: Meta, private mediaService: MediaService) { }

  ngOnInit(): void {
    this.setHomeMeta();
    this.loadMedia();
  }

  loadMedia(): void {
    this.loadingFeaturedMedia = true;
    this.loadingMediaList = true;
    this.loadingMediaTop = true;
    this.mediaService.findPage({ limit: 30, sort: 'desc(updatedAt)' }, withCache({ key: CacheKey.LATEST_MEDIA })).subscribe({
      next: data => {
        this.latestMedia = data;
      }
    }).add(() => {
      this.loadingMediaList = false;
      this.ref.markForCheck();
    });
    this.mediaService.findPage({ limit: 5, sort: 'desc(createdAt)' }, withCache({ key: CacheKey.FEATURED_MEDIA })).subscribe({
      next: data => {
        this.featuredMedia = data.results;
      }
    }).add(() => {
      this.loadingFeaturedMedia = false;
      this.ref.markForCheck();
    });
    concat(
      this.mediaService.findPage({ limit: 10, sort: 'desc(views)' }, withCache({ key: CacheKey.MOST_VIEWED_MEDIA }))
        .pipe(tap(data => {
          this.mostViewedMedia = data;
        })),
      this.mediaService.findPage({ limit: 10, sort: 'desc(ratingAverage)' }, withCache({ key: CacheKey.TOP_RATED_MEDIA }))
        .pipe(tap(data => {
          this.topRatedMedia = data;
        }))
    ).subscribe().add(() => {
      this.loadingMediaTop = false;
      this.ref.markForCheck();
    });
  }

  setHomeMeta(): void {
    this.meta.addTags([
      {
        name: 'description',
        content: 'KamPlex'
      },
      {
        property: 'og:site_name',
        content: 'KamPlex'
      },
      {
        property: 'og:title',
        content: 'KamPlex - Home'
      },
      {
        property: 'og:description',
        content: 'Online Movie and TV Show streaming site'
      }
    ]);
  }
}
