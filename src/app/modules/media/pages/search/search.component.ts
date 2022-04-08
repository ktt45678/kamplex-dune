import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, takeUntil } from 'rxjs';

import { DestroyService, MediaService } from '../../../../core/services';
import { MediaFilterOptionsDto, PaginateMediaDto } from '../../../../core/dto/media';
import { Media, Paginated } from '../../../../core/models';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MediaService, DestroyService]
})
export class SearchComponent implements OnInit {
  itemsPerPage: number = 30;
  loadingMediaList: boolean = false;
  mediaList?: Paginated<Media>;

  constructor(private ref: ChangeDetectorRef, private route: ActivatedRoute, private router: Router,
    private mediaService: MediaService, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroyService)).subscribe(qp => {
      this.findAllMedia(qp);
    });
  }

  onMediaFilterUpdate(event: MediaFilterOptionsDto): void {
    this.router.navigate([], { queryParams: event });
  }

  onPageChange(event: any): void {
    this.router.navigate([], { queryParams: { page: event.page + 1 }, queryParamsHandling: 'merge' });
  }

  findAllMedia(options?: PaginateMediaDto) {
    this.loadingMediaList = true;
    this.mediaService.findPage({
      ...options,
      limit: this.itemsPerPage
    }).pipe(delay(1000)).subscribe({
      next: data => {
        this.mediaList = data;
        this.ref.markForCheck();
      }
    }).add(() => this.loadingMediaList = false);
  }
}
