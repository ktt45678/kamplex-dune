import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { MenuItem } from 'primeng/api';
import { first, Observable, takeUntil } from 'rxjs';

import { CanComponentDeactivate } from '../../../core/guards';
import { DestroyService, QueueUploadService } from '../../../core/services';
import { QueueUploadStatus } from '../../../core/enums';
import { FileUpload } from '../../../core/utils';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class AdminLayoutComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  sideBarItems: MenuItem[] = [];
  tabMenuItems: MenuItem[] = [];
  uploadQueue: FileUpload[] = [];
  displayQueue: Observable<boolean>;
  timeRemaining: Observable<number>;
  totalUploading: number = 0;
  percent: number = 10;

  constructor(private ref: ChangeDetectorRef, private queueUploadService: QueueUploadService,
    private translocoService: TranslocoService, private destroyService: DestroyService) {
    this.displayQueue = this.queueUploadService.displayQueue;
    this.timeRemaining = this.queueUploadService.timeRemaining;
  }

  ngOnInit(): void {
    this.translocoService.selectTranslation('admin').pipe(first()).subscribe(t => {
      this.sideBarItems = [
        { label: t['menu.media'], routerLink: '/admin/media' },
        { label: t['menu.genres'], routerLink: '/admin/genres' },
        { label: t['menu.productions'], routerLink: '/admin/productions' },
        { separator: true, },
        { label: t['menu.users'], routerLink: '/admin/users' },
        { label: t['menu.roles'], routerLink: '/admin/roles' },
        { separator: true, },
        { label: t['menu.auditLog'], routerLink: '/admin/audit-log' },
        { label: t['menu.settings'], routerLink: '/admin/settings' }
      ];
      this.tabMenuItems = [
        { label: t['menu.media'], routerLink: '/admin/media' },
        { label: t['menu.genres'], routerLink: '/admin/genres' },
        { label: t['menu.productions'], routerLink: '/admin/productions' },
        { label: t['menu.users'], routerLink: '/admin/users' },
        { label: t['menu.roles'], routerLink: '/admin/roles' },
        { label: t['menu.auditLog'], routerLink: '/admin/audit-log' },
        { label: t['menu.settings'], routerLink: '/admin/settings' }
      ];
    });
    this.queueUploadService.uploadQueue.pipe(takeUntil(this.destroyService)).subscribe({
      next: queue => {
        this.uploadQueue = queue;
        this.totalUploading = queue.filter(u => u.status === QueueUploadStatus.UPLOADING).length;
        this.ref.markForCheck();
      }
    });
  }

  hideUploadQueue(): void {
    this.queueUploadService.hideQueue();
  }

  cancelUpload(upload: FileUpload): void {
    upload.cancel();
    this.queueUploadService.removeFromQueue(upload);
  }

  trackId(index: number, item: any): any {
    return item?.id;
  }

  trackCreateUrl(index: number, item: any): any {
    return item?.createUrl;
  }

  ngOnDestroy(): void {
    this.uploadQueue.forEach(upload => {
      upload.cancel();
    });
  }

  canDeactivate(): boolean {
    if (this.totalUploading > 0)
      return window.confirm(this.translocoService.translate('window.leaveSite'));
    return true
  }

  @HostListener('window:beforeunload', ['$event'])
  handleClose($event: BeforeUnloadEvent) {
    if (this.totalUploading > 0)
      $event.returnValue = window.confirm();
  }

}
