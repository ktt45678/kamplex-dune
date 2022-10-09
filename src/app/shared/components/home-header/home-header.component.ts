import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { takeUntil } from 'rxjs';

import { Media, UserDetails } from '../../../core/models';
import { AuthService, DestroyService, MediaService } from '../../../core/services';
import { PermissionPipeService } from '../../pipes/permission-pipe';
import { MediaType, UserPermission } from '../../../core/enums';

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
  MediaType = MediaType;
  currentUser: UserDetails | null;
  userMenuItems: MenuItem[];
  mediaSuggestions: Media[] = [];
  isMobileMenuOpened: boolean = false;
  displayMobileSearch: boolean = false;
  currentPageYOffset: number;
  bgTransparent: string = 'tw-bg-transparent';
  bgDark: string = 'tw-bg-neutral-900';

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private router: Router, private authService: AuthService, private mediaService: MediaService,
    private permissionPipeService: PermissionPipeService,
    private destroyService: DestroyService) {
    this.currentPageYOffset = window.pageYOffset;
    this.currentUser = null;
    this.userMenuItems = [
      {
        label: 'Sign out',
        icon: PrimeIcons.SIGN_OUT,
        command: () => this.onSignOut()
      }
    ];
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroyService)).subscribe(user => {
      this.currentUser = user;
      if (user) {
        if (this.permissionPipeService.hasPermission(user, [UserPermission.MANAGE_MEDIA])) {
          this.userMenuItems = [
            {
              label: 'Manage media',
              icon: 'ms ms-movie',
              routerLink: '/admin/media'
            },
            {
              label: 'Settings',
              icon: 'ms ms-settings'
            },
            {
              label: 'Sign out',
              icon: 'ms ms-logout',
              command: () => this.onSignOut()
            }
          ];
        }
      }
      this.ref.markForCheck();
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.isMobileMenuOpened || !this.isFixedNavbar) return;
    const element = this.document.getElementById('navbar');
    if (!element) return;
    if (window.pageYOffset > this.currentPageYOffset) {
      this.renderer.removeClass(element, this.bgTransparent);
      this.renderer.addClass(element, this.bgDark);
    } else if (!this.isMobileMenuOpened) {
      this.renderer.removeClass(element, this.bgDark);
      this.renderer.addClass(element, this.bgTransparent);
    }
  }

  onOpenMenu(): void {
    this.isMobileMenuOpened = !this.isMobileMenuOpened;
    if (!this.isFixedNavbar) return;
    const element = this.document.getElementById('navbar');
    if (!element) return;
    if (this.isMobileMenuOpened) {
      this.renderer.removeClass(element, this.bgTransparent);
      this.renderer.addClass(element, this.bgDark);
    } else {
      this.renderer.removeClass(element, this.bgDark);
      this.renderer.addClass(element, this.bgTransparent);
      if (!this.isFixedNavbar) return;
      if (window.pageYOffset > this.currentPageYOffset) {
        this.renderer.removeClass(element, this.bgTransparent);
        this.renderer.addClass(element, this.bgDark);
      } else {
        this.renderer.removeClass(element, this.bgDark);
        this.renderer.addClass(element, this.bgTransparent);
      }
    }
  }

  toggleMobileSearch(): void {
    this.displayMobileSearch = !this.displayMobileSearch;
    this.ref.markForCheck();
    if (this.displayMobileSearch) {
      setTimeout(() => {
        this.mediaSearch?.inputEL.nativeElement.focus();
      }, 0)
    }
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
      }
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
