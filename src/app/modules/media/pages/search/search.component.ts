import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';

import { MediaFilterComponent } from '../../../../shared/components/media-filter';
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
export class SearchComponent implements OnInit, AfterViewInit {
  @ViewChild('mediaFilter') mediaFilter?: MediaFilterComponent;
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

  ngAfterViewInit(): void {
    const filterOptions = this.route.snapshot.queryParamMap;
    this.mediaFilter?.patchOptions({
      search: filterOptions.get('search') ?? undefined,
      genres: filterOptions.getAll('genres'),
      sort: filterOptions.get('sort'),
      type: filterOptions.get('type'),
      status: filterOptions.get('status'),
      originalLanguage: filterOptions.get('originalLanguage'),
      year: Number(filterOptions.get('year')) || undefined
    })
  }

  onMediaFilterUpdate(event: MediaFilterOptionsDto): void {
    this.router.navigate([], { queryParams: event });
  }

  onPageChange(event: any): void {
    this.router.navigate([], { queryParams: { page: event.page + 1 }, queryParamsHandling: 'merge' });
    this.mediaFilter?.el.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  findAllMedia(options?: PaginateMediaDto) {
    this.loadingMediaList = true;
    this.mediaService.findPage({
      ...options,
      limit: this.itemsPerPage
    }).subscribe({
      next: data => {
        this.mediaList = data;
        this.ref.markForCheck();
      }
    }).add(() => this.loadingMediaList = false);
  }
}
