import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { AutoComplete } from 'primeng/autocomplete';
import { filter, first, Subscription, takeUntil } from 'rxjs';

import { CursorPaginated, Genre, Media, UserDetails } from '../../../core/models';
import { AuthService, DestroyService, GenresService, MediaService } from '../../../core/services';
import { MediaType, UserPermission } from '../../../core/enums';
import { track_Id } from '../../../core/utils';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class HomeHeaderComponent implements OnInit {
  @ViewChild('mediaSearch') mediaSearch?: AutoComplete;
  @Input() isFixedNavbar: boolean = false;
  @Input() navbarSpacing: boolean = true;
  track_Id = track_Id;
  MediaType = MediaType;
  UserPermission = UserPermission;
  currentUser!: UserDetails | null;
  mediaSuggestions: Media[] = [];
  genreList?: CursorPaginated<Genre>;
  isMobileMenuOpened: boolean = false;
  displaySidebar: boolean = false;
  displaySidebarGenres: boolean = false;
  loadingGenres: boolean = false;
  loadingMoreGenres: boolean = false;
  displayMobileSearch: boolean = false;
  genreLimit: number = 48;
  currentPageYOffset: number;
  //bgTransparent: string = 'tw-bg-opacity-80';
  //bgDark: string = 'tw-bg-opacity-100';
  showTop: string = 'tw-top-0';
  hideTop: string = '-tw-top-14';
  headerHeight: number = 56;
  sidebarNavigationSub?: Subscription;
  skeletonArray: Array<any> = [];

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private router: Router, private authService: AuthService, private mediaService: MediaService, private genresService: GenresService,
    private destroyService: DestroyService) {
    this.currentPageYOffset = window.pageYOffset + this.headerHeight;
    this.skeletonArray = new Array(this.genreLimit);
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      this.currentUser = user;
      this.ref.markForCheck();
    });
    this.loadGenres();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.isMobileMenuOpened || this.displayMobileSearch || !this.isFixedNavbar) return;
    const element = this.document.getElementById('navbar');
    if (!element) return;
    if (window.pageYOffset > this.currentPageYOffset) {
      this.renderer.removeClass(element, this.showTop);
      this.renderer.addClass(element, this.hideTop);
    } else if (!this.isMobileMenuOpened) {
      this.renderer.removeClass(element, this.hideTop);
      this.renderer.addClass(element, this.showTop);
    }
  }

  toggleMobileMenu(): void {
    //this.isMobileMenuOpened = !this.isMobileMenuOpened;
    this.displaySidebar = !this.displaySidebar;
    /*
    if (!this.isFixedNavbar) return;
    const element = this.document.getElementById('navbar');
    if (!element) return;
    if (this.isMobileMenuOpened) {
      this.renderer.removeClass(element, this.showTop);
      this.renderer.addClass(element, this.hideTop);
    } else {
      this.renderer.removeClass(element, this.hideTop);
      this.renderer.addClass(element, this.showTop);
      if (!this.isFixedNavbar) return;
      if (window.pageYOffset > this.currentPageYOffset) {
        this.renderer.removeClass(element, this.showTop);
        this.renderer.addClass(element, this.hideTop);
      } else {
        this.renderer.removeClass(element, this.hideTop);
        this.renderer.addClass(element, this.showTop);
      }
    }
    */
  }

  onSidebarVisibleChange(visible: boolean) {
    if (this.sidebarNavigationSub && !this.sidebarNavigationSub.closed)
      this.sidebarNavigationSub?.unsubscribe();
    if (visible) {
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        first()
      ).subscribe(() => {
        this.displaySidebar = false;
      });
    }
  }

  loadGenres(resetList?: boolean, pageToken?: string): void {
    if (resetList)
      this.loadingGenres = true;
    else
      this.loadingMoreGenres = true;
    const sort = 'asc(name)';
    this.genresService.findPageCursor({
      pageToken: pageToken,
      sort: sort,
      limit: this.genreLimit
    }).subscribe(newList => {
      this.appendPlaylists(newList);
    }).add(() => {
      if (resetList)
        this.loadingGenres = false;
      else
        this.loadingMoreGenres = false;
      this.updateGenreSkeletonArray();
      this.ref.markForCheck();
    });
  }

  appendPlaylists(newList: CursorPaginated<Genre>, resetList?: boolean): void {
    if (!this.genreList || resetList) {
      this.genreList = newList;
      return;
    }
    this.genreList = {
      hasNextPage: newList.hasNextPage,
      nextPageToken: newList.nextPageToken,
      prevPageToken: newList.prevPageToken,
      totalResults: newList.totalResults,
      results: [...this.genreList.results, ...newList.results]
    };
  }

  updateGenreSkeletonArray(): void {
    if (!this.genreList || !this.genreLimit) return;
    const itemLeft = this.genreList.totalResults - this.genreList.results.length;
    if (itemLeft < this.genreLimit) {
      this.skeletonArray = new Array(itemLeft);
    }
  }

  onScroll(): void {
    if (!this.genreList || !this.genreList.hasNextPage || this.loadingMoreGenres) return;
    this.loadGenres(false, this.genreList.nextPageToken);
  }

  toggleMobileSearch(): void {
    this.displayMobileSearch = !this.displayMobileSearch;
    this.ref.markForCheck();
    if (this.displayMobileSearch) {
      setTimeout(() => {
        this.mediaSearch?.inputEL?.nativeElement.focus();
      }, 0);
    }
  }

  clearSearchInput(): void {
    this.mediaSearch?.clear();
    setTimeout(() => {
      this.mediaSearch?.inputEL?.nativeElement.focus();
    }, 0);
  }

  loadMediaSuggestions(query: string): void {
    this.mediaService.findPage({
      page: 1,
      limit: 10,
      search: query
    }).subscribe(paginated => {
      this.mediaSuggestions = paginated.results;
      this.ref.markForCheck();
    });
  }

  loadAdvancedSearch(search: string | null | undefined): void {
    this.router.navigate(['/search'], { queryParams: { search: search || undefined } });
  }

  onMediaSearchKeyUp(event: KeyboardEvent, autoComplete: AutoComplete): void {
    if (event.key === 'Enter') {
      if (autoComplete.highlightOption) {
        this.router.navigate(['/details', autoComplete.highlightOption._id]);
        return;
      } else if (!autoComplete.inputValue)
        return;
      autoComplete.overlayVisible = false;
      autoComplete.cd.markForCheck();
      this.loadAdvancedSearch(autoComplete.value);
    }
  }

  onSignOut(): void {
    this.authService.signOut().subscribe().add(() => {
      this.router.navigate(['/sign-in']);
    });
  }

}
