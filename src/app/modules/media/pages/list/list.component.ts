import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { map, takeUntil } from 'rxjs';

import { CursorPageMediaDto, OffsetPageMediaDto } from '../../../../core/dto/media';
import { CursorPaginated, Media } from '../../../../core/models';
import { DestroyService, GenresService, MediaService, ProductionsService, TagsService } from '../../../../core/services';
import { SITE_NAME } from '../../../../../environments/config';
import { MediaType } from '../../../../core/enums';

type ListPath = 'movie' | 'tv' | 'added' | 'updated' | 'newReleases' | 'mostViewed' | 'topRated' | 'genre' | 'studio' | 'producer'
  | 'tag';

type HandleListOptions = HandleListPath | HandleListSubPath;

interface HandleListBase {
  resetList: boolean;
  nextPageToken?: string;
}

interface HandleListPath extends HandleListBase {
  path: 'movie' | 'tv' | 'added' | 'updated' | 'newReleases' | 'mostViewed' | 'topRated';
  resetList: boolean;
  nextPageToken?: string;
}

interface HandleListSubPath extends HandleListBase {
  path: 'genre' | 'studio' | 'producer' | 'tag';
  subPath: string;
  resetSubPath: boolean;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class ListComponent implements OnInit, OnDestroy {
  itemsPerPage: number = 30;
  loadingMediaList: boolean = false;
  loadingMoreMediaList: boolean = false;
  shouldResetList: boolean = false;
  currentPath?: ListPath;
  currentSubPath?: string;
  subPathLabel?: string;
  mediaList?: CursorPaginated<Media>;

  constructor(private ref: ChangeDetectorRef, private title: Title, private meta: Meta, private translocoService: TranslocoService,
    private mediaService: MediaService, private genresService: GenresService, private productionsService: ProductionsService,
    private tagsService: TagsService, private route: ActivatedRoute, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroyService)).subscribe(params => {
      const path: ListPath = params['path'];
      const subPath = params['sub_path'];
      if (!path) return;
      if (path !== this.currentPath || subPath !== this.currentSubPath) {
        this.currentPath = path;
        this.currentSubPath = subPath;
        this.shouldResetList = true;
        this.subPathLabel = undefined;
        this.mediaList = undefined;
      }
      this.handlePath({ path, subPath, resetList: true, resetSubPath: this.shouldResetList });
    });
  }

  handlePath(options: HandleListOptions) {
    switch (options.path) {
      case 'movie':
        this.loadMediaCursor(options.path, options.resetList, { type: MediaType.MOVIE, pageToken: options.nextPageToken });
        break;
      case 'tv':
        this.loadMediaCursor(options.path, options.resetList, { type: MediaType.TV, pageToken: options.nextPageToken });
        break;
      case 'added':
        this.loadMediaCursor(options.path, options.resetList, { sort: 'desc(_id)', pageToken: options.nextPageToken });
        break;
      case 'updated':
        this.loadMediaCursor(options.path, options.resetList, { sort: 'desc(updatedAt)', pageToken: options.nextPageToken });
        break;
      case 'newReleases':
        this.loadMediaOffset(options.path, options.resetList, {
          sort: 'desc(releaseDate.year,releaseDate.month,releaseDate.day)',
          page: Number(options.nextPageToken)
        });
        break;
      case 'mostViewed':
        this.loadMediaOffset(options.path, options.resetList, { sort: 'desc(views)', page: Number(options.nextPageToken) });
        break;
      case 'topRated':
        this.loadMediaOffset(options.path, options.resetList, { sort: 'desc(ratingAverage)', page: Number(options.nextPageToken) });
        break;
      case 'genre':
        options.resetSubPath && this.findGenreName(options.subPath);
        this.loadMediaByGenre(options.subPath, options.resetList, options.nextPageToken);
        break;
      case 'studio':
      case 'producer':
        options.resetSubPath && this.findProductionName(options.subPath);
        this.loadMediaByProduction(options.subPath, options.resetList, options.path, options.nextPageToken);
        break;
      case 'tag':
        options.resetSubPath && this.findTagName(options.subPath);
        this.loadMediaByTag(options.subPath, options.resetList, options.nextPageToken);
        break;
    }
  }

  findGenreName(id: string): void {
    this.genresService.findOne(id).subscribe(genre => {
      this.subPathLabel = genre.name;
      this.setTitleAndMeta(genre.name);
      this.ref.markForCheck();
    });
  }

  findProductionName(id: string): void {
    this.productionsService.findOne(id).subscribe(production => {
      this.subPathLabel = production.name;
      this.setTitleAndMeta(production.name);
      this.ref.markForCheck();
    });
  }

  findTagName(id: string): void {
    this.tagsService.findOne(id).subscribe(tag => {
      this.subPathLabel = tag.name;
      this.setTitleAndMeta(tag.name);
      this.ref.markForCheck();
    });
  }

  loadMediaCursor(path: string, resetList: boolean, options?: CursorPageMediaDto): void {
    this.loadMediaPath(path);
    this.preMediaLoad(resetList);
    options = Object.assign({}, { sort: 'desc(_id)', limit: this.itemsPerPage }, options);
    this.mediaService.findPageCursor(options).subscribe(mediaList => {
      this.appendMediaList(mediaList);
    }).add(() => {
      this.postMediaLoad(resetList);
      this.ref.markForCheck();
    });
  }

  loadMediaOffset(path: string, resetList: boolean, options?: OffsetPageMediaDto): void {
    this.loadMediaPath(path);
    this.preMediaLoad(resetList);
    options = Object.assign({}, { sort: 'desc(_id)', limit: this.itemsPerPage }, options);
    this.mediaService.findPage(options).pipe(map(mediaList => {
      const convertedMediaList: CursorPaginated<Media> = {
        hasNextPage: mediaList.page < mediaList.totalPages,
        nextPageToken: String(mediaList.page + 1),
        prevPageToken: mediaList.page > 1 ? String(mediaList.page - 1) : undefined,
        totalResults: mediaList.totalResults,
        results: mediaList.results
      }
      return convertedMediaList;
    })).subscribe(mediaList => {
      this.appendMediaList(mediaList);
    }).add(() => {
      this.postMediaLoad(resetList);
      this.ref.markForCheck();
    });
  }

  loadMediaPath(path: string): void {
    this.translocoService.selectTranslate(`listPaths.${path}`, {}, { scope: 'media' }).subscribe(category => {
      this.setTitleAndMeta(category);
    });
  }

  loadMediaByGenre(id: string, resetList: boolean, pageToken?: string): void {
    this.preMediaLoad(resetList);
    const sort = 'desc(_id)';
    this.genresService.findAllMedia(id, { pageToken, sort, limit: this.itemsPerPage }).subscribe(mediaList => {
      this.appendMediaList(mediaList);
    }).add(() => {
      this.postMediaLoad(resetList);
      this.ref.markForCheck();
    });
  }

  loadMediaByProduction(id: string, resetList: boolean, type?: 'studio' | 'producer', pageToken?: string): void {
    this.preMediaLoad(resetList);
    const sort = 'desc(_id)';
    this.productionsService.findAllMedia(id, { type, pageToken, sort, limit: this.itemsPerPage }).subscribe(mediaList => {
      this.appendMediaList(mediaList);
    }).add(() => {
      this.postMediaLoad(resetList);
      this.ref.markForCheck();
    });
  }

  loadMediaByTag(id: string, resetList: boolean, pageToken?: string): void {
    this.preMediaLoad(resetList);
    const sort = 'desc(_id)';
    this.tagsService.findAllMedia(id, { pageToken, sort, limit: this.itemsPerPage }).subscribe(mediaList => {
      this.appendMediaList(mediaList);
    }).add(() => {
      this.postMediaLoad(resetList);
      this.ref.markForCheck();
    });
  }

  onScroll(): void {
    if (!this.currentPath || !this.mediaList) return;
    if (!this.mediaList.hasNextPage) return;
    if (this.currentPath === 'genre' || this.currentPath === 'studio' || this.currentPath === 'producer' || this.currentPath === 'tag') {
      if (!this.currentSubPath) return;
      this.handlePath({
        path: this.currentPath, subPath: this.currentSubPath, resetList: false,
        resetSubPath: true, nextPageToken: this.mediaList.nextPageToken
      });
      return;
    }
    this.handlePath({ path: this.currentPath, resetList: false, nextPageToken: this.mediaList.nextPageToken });
  }

  appendMediaList(newList: CursorPaginated<Media>): void {
    if (!this.mediaList || this.shouldResetList) {
      this.mediaList = newList;
      this.shouldResetList = false;
      return;
    }
    if (this.mediaList.nextPageToken === newList.nextPageToken && this.mediaList.prevPageToken === newList.prevPageToken)
      return;
    this.mediaList = {
      hasNextPage: newList.hasNextPage,
      nextPageToken: newList.nextPageToken,
      prevPageToken: newList.prevPageToken,
      totalResults: newList.totalResults,
      results: [...this.mediaList.results, ...newList.results]
    }
  }

  setTitleAndMeta(category: string): void {
    this.title.setTitle(`${category} - ${SITE_NAME}`);
    this.meta.updateTag({ name: 'description', content: `Explore ${category} Shows` });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:title', content: category });
    this.meta.updateTag({ property: 'og:description', content: `Explore ${category} Shows` });
  }

  ngOnDestroy(): void {
    this.title.setTitle(SITE_NAME);
    this.meta.removeTag('name="description"');
    this.meta.removeTag('property="og:site_name"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
  }

  private preMediaLoad(resetList: boolean): void {
    if (resetList)
      this.loadingMediaList = true;
    else
      this.loadingMoreMediaList = true;
    this.ref.markForCheck();
  }

  private postMediaLoad(resetList: boolean): void {
    if (resetList)
      this.loadingMediaList = false;
    else
      this.loadingMoreMediaList = false;
    this.ref.markForCheck();
  }
}
