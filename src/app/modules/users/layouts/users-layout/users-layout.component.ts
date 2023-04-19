import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { MenuItem } from 'primeng/api';
import { filter, first, map, switchMap, takeUntil } from 'rxjs';

import { UserDetails } from '../../../../core/models';
import { AuthService, DestroyService, UsersService } from '../../../../core/services';
import { UsersStateService } from '../../services';
import { SITE_NAME } from '../../../../../environments/config';

@Component({
  selector: 'app-users-layout',
  templateUrl: './users-layout.component.html',
  styleUrls: ['./users-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    UsersStateService,
    DestroyService
  ]
})
export class UsersLayoutComponent implements OnInit, OnDestroy {
  user?: UserDetails;
  userMenuItems: MenuItem[] = [];

  constructor(private ref: ChangeDetectorRef, private title: Title, private usersStateService: UsersStateService,
    private authService: AuthService, private usersService: UsersService, private route: ActivatedRoute,
    private translocoService: TranslocoService, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => id != null),
      switchMap(id => this.usersService.findOne(id)),
      takeUntil(this.destroyService)
    ).subscribe(user => {
      this.user = user;
      this.usersStateService.user = user;
      this.title.setTitle(`${user.nickname || user.username} - ${SITE_NAME}`);
      this.initMenuItems();
      this.ref.markForCheck();
    });
  }

  initMenuItems(): void {
    this.translocoService.selectTranslation('users').pipe(first()).subscribe(t => {
      const menuItems: MenuItem[] = [{
        label: t['menu.profile'],
        routerLink: './',
        routerLinkActiveOptions: { exact: true }
      }];
      if (this.authService.currentUser && this.authService.currentUser._id === this.usersStateService.user!._id) {
        menuItems.push({
          label: t['menu.history'],
          routerLink: './history'
        });
      }
      menuItems.push({
        label: t['menu.playlists'],
        routerLink: './playlists'
      }, {
        label: t['menu.rated'],
        routerLink: './rated'
      });
      this.userMenuItems = menuItems;
      this.ref.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.title.setTitle(SITE_NAME);
  }

}
