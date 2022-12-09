import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { AutoComplete } from 'primeng/autocomplete';
import { takeUntil } from 'rxjs';

import { Genre, Media, UserDetails } from '../../../core/models';
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
  track_Id = track_Id;
  MediaType = MediaType;
  UserPermission = UserPermission;
  currentUser!: UserDetails | null;
  mediaSuggestions: Media[] = [];
  genres: Genre[] = [];
  isMobileMenuOpened: boolean = false;
  displayMobileSearch: boolean = false;
  currentPageYOffset: number;
  //bgTransparent: string = 'tw-bg-opacity-80';
  //bgDark: string = 'tw-bg-opacity-100';
  showTop: string = 'tw-top-0';
  hideTop: string = '-tw-top-14';
  headerHeight: number = 56;

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private router: Router, private authService: AuthService, private mediaService: MediaService, private genresService: GenresService,
    private destroyService: DestroyService) {
    this.currentPageYOffset = window.pageYOffset + this.headerHeight;
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      this.currentUser = user;
      this.ref.markForCheck();
    });
    this.genresService.findAll('asc(name)').subscribe(genres => {
      this.genres = genres;
    });
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

  onOpenMobileMenu(): void {
    this.isMobileMenuOpened = !this.isMobileMenuOpened;
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

  toggleMobileSearch(): void {
    this.displayMobileSearch = !this.displayMobileSearch;
    this.ref.markForCheck();
    if (this.displayMobileSearch) {
      setTimeout(() => {
        this.mediaSearch?.inputEL.nativeElement.focus();
      }, 0);
    }
  }

  clearSearchInput(): void {
    this.mediaSearch?.clear();
    setTimeout(() => {
      this.mediaSearch?.inputEL.nativeElement.focus();
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

  loadAdvancedSearch(search: string): void {
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
      this.loadAdvancedSearch(autoComplete.inputValue);
    }
  }

  onSignOut(): void {
    this.authService.signOut();
    this.router.navigate(['/sign-in']);
  }

}
