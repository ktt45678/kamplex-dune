import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { MenuItem } from 'primeng/api';
import { first, Observable } from 'rxjs';

import { FileUpload } from '../../../core/models';
import { QueueUploadService } from '../../../core/services';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent implements OnInit {
  sideBarItems: MenuItem[] = [];
  tabMenuItems: MenuItem[] = [];
  uploadQueue: Observable<FileUpload[]>;

  constructor(private queueUploadService: QueueUploadService, private translocoService: TranslocoService) {
    this.uploadQueue = this.queueUploadService.uploadQueue;
  }

  ngOnInit(): void {
    this.translocoService.selectTranslation('admin').pipe(first()).subscribe(t => {
      this.sideBarItems = [
        {
          label: t['menu.media'],
          routerLink: '/admin/media'
        },
        {
          label: t['menu.genres'],
          routerLink: '/admin/genres'
        },
        {
          label: t['menu.producers'],
          routerLink: '/admin/producers'
        },
        {
          separator: true,
        },
        {
          label: t['menu.users'],
          routerLink: '/admin/users'
        },
        {
          label: t['menu.roles'],
          routerLink: '/admin/roles'
        },
        {
          separator: true,
        },
        {
          label: t['menu.auditLog'],
          routerLink: '/admin/audit-log'
        },
        {
          label: t['menu.settings'],
          routerLink: '/admin/settings'
        }
      ];
      this.tabMenuItems = [
        {
          label: t['menu.media'],
          routerLink: '/admin/media'
        },
        {
          label: t['menu.genres'],
          routerLink: '/admin/genres'
        },
        {
          label: t['menu.producers'],
          routerLink: '/admin/producers'
        },
        {
          label: t['menu.users'],
          routerLink: '/admin/users'
        },
        {
          label: t['menu.roles'],
          routerLink: '/admin/roles'
        },
        {
          label: t['menu.auditLog'],
          routerLink: '/admin/audit-log'
        },
        {
          label: t['menu.settings'],
          routerLink: '/admin/settings'
        }
      ];
    });
  }

}
