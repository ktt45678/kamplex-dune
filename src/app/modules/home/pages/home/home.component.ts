import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { Media, Paginated } from '../../../../core/models';
import { MediaService } from '../../../../core/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MediaService]
})
export class HomeComponent implements OnInit {
  loadingMediaList: boolean = false;
  loadingMediaTop: boolean = false;
  featuredMedia?: Media[];
  mediaList?: Paginated<Media>;
  mostViewedMedia?: Paginated<Media>;

  constructor(private ref: ChangeDetectorRef, private mediaService: MediaService) { }

  ngOnInit(): void {
    this.loadingMediaList = true;
    this.mediaService.findAll().subscribe({
      next: data => {
        this.featuredMedia = data.results.slice(0, 5);
        this.mediaList = data;
        this.mostViewedMedia = {
          ...data,
          results: data.results.slice(0, 5)
        }
      },
      complete: () => {
        this.loadingMediaList = false;
        this.ref.markForCheck();
      }
    });
  }

}
