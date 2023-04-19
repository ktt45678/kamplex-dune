import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { MenuItem } from 'primeng/api';
import { first, takeUntil } from 'rxjs';

import { DestroyService } from '../../../../core/services';

@Component({
  selector: 'app-settings-layout',
  templateUrl: './settings-layout.component.html',
  styleUrls: ['./settings-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class SettingsLayoutComponent implements OnInit {
  settingItems: MenuItem[] = [];
  mobileMenu: boolean = false;

  constructor(private ref: ChangeDetectorRef, private translocoService: TranslocoService,
    private breakpointObserver: BreakpointObserver, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.initMenuItems();
    this.breakpointObserver.observe('(min-width: 768px)').pipe(takeUntil(this.destroyService)).subscribe(state => {
      this.mobileMenu = !state.matches;
      this.ref.markForCheck();
    });
  }

  initMenuItems(): void {
    this.translocoService.selectTranslation('users').pipe(first()).subscribe(t => {
      const settingItems: MenuItem[] = [
        {
          label: t['settings.myAccount'],
          routerLink: './',
          routerLinkActiveOptions: { exact: true }
        },
        {
          label: t['settings.profile'],
          routerLink: 'profile'
        },
        {
          label: t['settings.privacy'],
          routerLink: 'privacy'
        },
        {
          label: t['settings.media'],
          routerLink: 'media'
        },
        {
          label: t['settings.subtitle'],
          routerLink: 'subtitle'
        }
      ];
      this.settingItems = settingItems;
      this.ref.markForCheck();
    });
  }
}
