import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { AutoComplete } from 'primeng/autocomplete';
import { DialogService } from 'primeng/dynamicdialog';
import { filter, first, Subscription, takeUntil } from 'rxjs';

import { CursorPaginated, Genre, Media, UserDetails } from '../../../core/models';
import { AuthService, DestroyService, GenresService, MediaService } from '../../../core/services';
import { MediaType, UserPermission } from '../../../core/enums';
import { track_Id } from '../../../core/utils';
import { SearchOverlayComponent } from '../../dialogs/search-overlay';

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
  UserPermission = UserPermission;
  currentUser!: UserDetails | null;
  genreList?: CursorPaginated<Genre>;
  isMobileMenuOpened: boolean = false;
  displaySidebar: boolean = false;
  displaySidebarGenres: boolean = false;
  loadingGenres: boolean = false;
  loadingMoreGenres: boolean = false;
  genreLimit: number = 48;
  currentPageYOffset: number;
  showTop: string = 'tw-top-0';
  hideTop: string = '-tw-top-14';
  headerHeight: number = 56;
  sidebarNavigationSub?: Subscription;
  skeletonArray: Array<any> = [];

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private router: Router, private dialogService: DialogService, private authService: AuthService,
    private mediaService: MediaService, private genresService: GenresService, private destroyService: DestroyService) {
    this.currentPageYOffset = window.scrollY + this.headerHeight;
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
    if (this.isMobileMenuOpened || !this.isFixedNavbar) return;
    const element = this.document.getElementById('navbar');
    if (!element) return;
    if (window.scrollY > this.currentPageYOffset) {
      this.renderer.removeClass(element, this.showTop);
      this.renderer.addClass(element, this.hideTop);
    } else if (!this.isMobileMenuOpened) {
      this.renderer.removeClass(element, this.hideTop);
      this.renderer.addClass(element, this.showTop);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onWindowKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey) {
      if (event.key === 'k') {
        event.preventDefault();
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  onWindowKeyup(event: KeyboardEvent): void {
    if (event.ctrlKey) {
      if (event.key === 'k') {
        this.showSearchDialog();
      }
    }
  }

  toggleMobileMenu(): void {
    this.displaySidebar = !this.displaySidebar;
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

  onGenresMenuScroll(): void {
    if (!this.genreList || !this.genreList.hasNextPage || this.loadingMoreGenres) return;
    this.loadGenres(false, this.genreList.nextPageToken);
  }

  showSearchDialog(): void {
    this.dialogService.open(SearchOverlayComponent, {
      width: '580px',
      modal: true,
      dismissableMask: true,
      minimal: true,
      position: 'top',
      closeOnNavigation: true,
      disableAnimation: true,
      styleClass: 'tw-bg-neutral-800'
    });
  }

  onSignOut(): void {
    this.authService.signOut().subscribe().add(() => {
      this.router.navigate(['/sign-in']);
    });
  }

}
