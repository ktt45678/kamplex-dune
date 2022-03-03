import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnInit } from '@angular/core';
import { MenuItem, PrimeIcons } from 'primeng/api';

import { UserDetails } from '../../../core/models';
import { AuthService, DestroyService } from '../../../core/services';
import { PermissionPipeService } from '../../pipes/permission-pipe';
import { UserPermission } from '../../../core/enums';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class HomeHeaderComponent implements OnInit {
  @Input() isFixedNavbar: boolean = false;
  currentUser: UserDetails | null;

  userMenuItems: MenuItem[];
  isMobileMenuOpened: boolean = false;
  currentPageYOffset: number;
  bgTransparent: string = 'tw-bg-transparent';
  bgDark: string = 'tw-bg-neutral-900';

  constructor(private ref: ChangeDetectorRef, private authService: AuthService, private permissionPipeService: PermissionPipeService,
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
              icon: 'pi bi-film'
            },
            {
              label: 'Settings',
              icon: PrimeIcons.COG
            },
            {
              label: 'Sign out',
              icon: PrimeIcons.SIGN_OUT,
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
    const element = document.getElementById('navbar');
    if (!element) return;
    if (window.pageYOffset > this.currentPageYOffset) {
      element.classList.remove(this.bgTransparent);
      element.classList.add(this.bgDark);
    } else if (!this.isMobileMenuOpened) {
      element.classList.remove(this.bgDark);
      element.classList.add(this.bgTransparent);
    }
  }

  onOpenMenu(): void {
    this.isMobileMenuOpened = !this.isMobileMenuOpened;
    if (!this.isFixedNavbar) return;
    const element = document.getElementById('navbar');
    if (!element) return;
    if (this.isMobileMenuOpened) {
      element.classList.remove(this.bgTransparent);
      element.classList.add(this.bgDark);
    } else {
      element.classList.remove(this.bgDark);
      element.classList.add(this.bgTransparent);
      if (!this.isFixedNavbar) return;
      if (window.pageYOffset > this.currentPageYOffset) {
        element.classList.remove(this.bgTransparent);
        element.classList.add(this.bgDark);
      } else {
        element.classList.remove(this.bgDark);
        element.classList.add(this.bgTransparent);
      }
    }
  }

  onSignOut(): void {
    this.authService.signOut();
  }

}
