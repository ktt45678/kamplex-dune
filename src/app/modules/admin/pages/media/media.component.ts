import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Renderer2, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Menu } from 'primeng/menu';
import { first, map, merge, Observable, of, takeUntil, tap } from 'rxjs';
import { escape } from 'lodash';

import { DestroyService, MediaService, QueueUploadService } from '../../../../core/services';
import { WsService } from '../../../../shared/modules/ws';
import { Media, MediaDetails, Paginated } from '../../../../core/models';
import { PaginateMediaDto } from '../../../../core/dto/media';
import { DataMenuItem } from '../../../../core/interfaces/primeng';
import { MediaChange } from '../../../../core/interfaces/ws';
import { CreateMediaComponent } from '../../dialogs/create-media';
import { ViewMediaComponent } from '../../dialogs/view-media';
import { ConfigureMediaComponent } from '../../dialogs/configure-media';
import { UpdateMediaComponent } from '../../dialogs/update-media';
import { MediaPStatus, MediaSourceStatus, MediaType, SocketMessage, SocketRoom } from '../../../../core/enums';
import { AddVideoComponent } from '../../dialogs/add-video';
import { AddSubtitleComponent } from '../../dialogs/add-subtitle';
import { AddSourceComponent } from '../../dialogs/add-source';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class MediaComponent implements OnInit, OnDestroy {
  MediaType = MediaType;
  MediaPStatus = MediaPStatus;

  @ViewChild('mediaTable') mediaTable?: Table;
  loadingMediaList: boolean = false;
  rowsPerPage: number = 10;
  mediaList?: Paginated<Media>;
  cachedMediaDetails?: MediaDetails;
  mediaMenuItems: DataMenuItem<Media>[] = [];

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private route: ActivatedRoute, private router: Router, public dialogService: DialogService,
    private confirmationService: ConfirmationService, private mediaService: MediaService,
    private queueUploadService: QueueUploadService, private wsService: WsService,
    private translocoService: TranslocoService, private destroyService: DestroyService) { }

  ngOnInit(): void {
    this.initSocket();
  }

  initSocket(): void {
    const connect$ = this.wsService.fromEvent('connect').pipe(tap(() => {
      this.wsService.joinRoom(SocketRoom.ADMIN_MEDIA_LIST);
    }));
    const refreshMedia$ = this.wsService.fromEvent<MediaChange>(SocketMessage.REFRESH_MEDIA).pipe(tap(data => {
      if (!data) return this.loadMedia(false);
      if (!this.mediaList) return;
      const mediaIndex = this.mediaList.results.findIndex(m => m._id === data.mediaId);
      if (mediaIndex === -1) return;
      this.loadMedia(false);
    }));
    const saveMovieSource$ = this.wsService.fromEvent<MediaChange>(SocketMessage.SAVE_MOVIE_SOURCE)
      .pipe(tap(data => this.updateMediaStatus(data.mediaId, MediaPStatus.PROCESSING)));
    const addMovieStream$ = this.wsService.fromEvent<MediaChange>(SocketMessage.ADD_MOVIE_STREAM)
      .pipe(tap(data => this.updateMediaStatus(data.mediaId, MediaPStatus.DONE)));
    const saveTVSource$ = this.wsService.fromEvent<MediaChange>(SocketMessage.SAVE_TV_SOURCE)
      .pipe(tap(data => this.updateMediaStatus(data.mediaId, MediaPStatus.PROCESSING)));
    const addTVStream$ = this.wsService.fromEvent<MediaChange>(SocketMessage.ADD_TV_STREAM)
      .pipe(tap(data => this.updateMediaStatus(data.mediaId, MediaPStatus.DONE)));
    merge(connect$, refreshMedia$, saveMovieSource$, addMovieStream$, saveTVSource$, addTVStream$)
      .pipe(takeUntil(this.destroyService)).subscribe();
  }

  updateMediaStatus(id: string, pStatus: MediaPStatus): void {
    if (!this.mediaList) return;
    const mediaIndex = this.mediaList.results.findIndex(m => m._id === id);
    if (mediaIndex === -1) return;
    this.mediaList.results[mediaIndex].pStatus = pStatus;
    this.ref.markForCheck();
  }

  loadMedia(showLoading: boolean = true): void {
    const params: PaginateMediaDto = {};
    params.includeHidden = true;
    params.includeUnprocessed = true;
    if (this.mediaTable) {
      params.limit = this.mediaTable.rows;
      params.page = this.mediaTable.first ? this.mediaTable.first / this.mediaTable.rows + 1 : 1;
      const sortOrder = this.mediaTable.sortOrder === -1 ? 'desc' : 'asc';
      if (this.mediaTable.sortField) {
        params.sort = `${sortOrder}(${this.mediaTable.sortField})`;
      }
      if (this.mediaTable.filters['title'] && !Array.isArray(this.mediaTable.filters['title'])
        && this.mediaTable.filters['title'].value.length >= 3) {
        params.search = this.mediaTable.filters['title'].value;
      }
    } else {
      params.page = 1;
      params.limit = this.rowsPerPage;
    }
    showLoading && (this.loadingMediaList = true);
    this.mediaService.findPage(params).subscribe({
      next: (mediaList) => {
        this.mediaList = mediaList;
        this.ref.markForCheck();
      }
    }).add(() => {
      showLoading && (this.loadingMediaList = false);
    });
  }

  findMediaDetails(mediaId: string) {
    if (this.cachedMediaDetails?._id === mediaId)
      return of(this.cachedMediaDetails);
    return this.mediaService.findOne(mediaId).pipe(tap(media => this.cachedMediaDetails = media));
  }

  showCreateMediaDialog(type: string): void {
    const dialogRef = this.dialogService.open(CreateMediaComponent, {
      data: { type },
      width: '1024px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem', 'overflow-y': 'hidden', 'padding': '0' },
      dismissableMask: false
    });
    dialogRef.onClose.pipe(first()).subscribe((result: boolean) => {
      if (!result) return;
      this.loadMedia();
    });
  }

  showViewMediaDialog(media: Media): void {
    this.dialogService.open(ViewMediaComponent, {
      data: { ...media },
      width: '1024px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
  }

  showConfigureMediaDialog(media: Media): void {
    const dialogRef = this.dialogService.open(ConfigureMediaComponent, {
      closeOnEscape: false,
      data: { ...media },
      width: '100%',
      height: '100%',
      modal: true,
      showHeader: false,
      contentStyle: { 'overflow-y': 'hidden', 'padding': '0' },
      styleClass: '!tw-max-h-full'
    });
    dialogRef.onClose.pipe(first()).subscribe((isUpdated: boolean) => {
      if (!isUpdated) return;
      this.loadMedia();
    });
  }

  showUpdateMediaDialog(media: Media): void {
    const dialogRef = this.dialogService.open(UpdateMediaComponent, {
      data: { ...media },
      width: '1024px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' },
      dismissableMask: false
    });
    dialogRef.onClose.pipe(first()).subscribe((result: boolean) => {
      if (!result) return;
      this.loadMedia();
    });
  }

  showAddMediaVideoDialog(media: Media): void {
    this.findMediaDetails(media._id).pipe(tap(mediaDetails => {
      this.dialogService.open(AddVideoComponent, {
        data: { ...mediaDetails },
        width: '700px',
        modal: true,
        dismissableMask: true,
        styleClass: 'p-dialog-header-sm',
        contentStyle: { 'margin-top': '-1.5rem' }
      });
    })).subscribe();
  }

  showAddSubtitleDialog(media: Media): void {
    this.findMediaDetails(media._id).pipe(tap(mediaDetails => {
      this.dialogService.open(AddSubtitleComponent, {
        data: { media: { ...mediaDetails } },
        width: '500px',
        modal: true,
        dismissableMask: true,
        styleClass: 'p-dialog-header-sm',
        contentStyle: { 'margin-top': '-1.5rem' }
      });
    })).subscribe();
  }

  showAddSourceDialog(media: Media): void {
    this.findMediaDetails(media._id).pipe(tap(mediaDetails => {
      this.dialogService.open(AddSourceComponent, {
        data: { ...mediaDetails },
        width: '500px',
        modal: true,
        dismissableMask: true,
        styleClass: 'p-dialog-header-sm',
        contentStyle: { 'margin-top': '-1.5rem' }
      });
    })).subscribe();
  }

  showDeleteMediaDialog(media: Media): void {
    const safeMediaTitle = escape(media.title);
    this.confirmationService.confirm({
      key: 'default',
      message: this.translocoService.translate('admin.media.deleteConfirmation', { name: safeMediaTitle }),
      header: this.translocoService.translate('admin.media.deleteConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => this.removeMedia(media._id)
    });
  }

  removeMedia(id: string): void {
    this.mediaService.remove(id).subscribe().add(() => {
      this.loadMedia();
    });
  }

  uploadPoster(media: Media, event: Event) {
    const element = <HTMLInputElement>event.target;
    if (!element.files?.length) return;
    this.renderer.setProperty(element, 'disabled', true);
    this.mediaService.uploadPoster(media._id, element.files[0]).subscribe({
      next: () => this.loadMedia()
    }).add(() => {
      if (this.document.body.contains(element)) {
        this.renderer.setProperty(element, 'disabled', false);
      }
    });
  }

  deletePoster(media: Media, event: Event) {
    const safeMediaTitle = escape(media.title);
    this.confirmationService.confirm({
      key: 'default',
      message: this.translocoService.translate('admin.media.deletePosterConfirmation', { name: safeMediaTitle }),
      header: this.translocoService.translate('admin.media.deletePosterConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => {
        const element = <HTMLButtonElement>event.target;
        this.renderer.setProperty(element, 'disabled', true);
        this.mediaService.deletePoster(media._id).subscribe().add(() => {
          this.renderer.setProperty(element, 'disabled', false);
          this.loadMedia();
        });
      }
    });
  }

  uploadBackdrop(media: Media, event: Event) {
    const element = <HTMLInputElement>event.target;
    if (!element.files?.length) return;
    this.renderer.setProperty(element, 'disabled', true);
    this.mediaService.uploadBackdrop(media._id, element.files[0]).subscribe({
      next: () => this.loadMedia()
    }).add(() => {
      if (this.document.body.contains(element)) {
        this.renderer.setProperty(element, 'disabled', false);
      }
    });
  }

  deleteBackdrop(media: Media, event: Event) {
    const safeMediaTitle = escape(media.title);
    this.confirmationService.confirm({
      key: 'default',
      message: this.translocoService.translate('admin.media.deleteBackdropConfirmation', { name: safeMediaTitle }),
      header: this.translocoService.translate('admin.media.deleteBackdropConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => {
        const element = <HTMLButtonElement>event.target;
        this.renderer.setProperty(element, 'disabled', true);
        this.mediaService.deleteBackdrop(media._id).subscribe().add(() => {
          this.renderer.setProperty(element, 'disabled', false);
          this.loadMedia();
        });
      }
    });
  }

  toggleMediaMenu(menu: Menu, event: Event, media: Media): void {
    if (!menu.visible) {
      this.createMediaMenuItem(media).subscribe({
        next: (menuItems) => {
          this.mediaMenuItems = menuItems;
          menu.toggle(event);
        }
      });
      return;
    }
    menu.toggle(event);
  }

  createMediaMenuItem(media: Media): Observable<DataMenuItem<Media>[]> {
    return this.translocoService.selectTranslation('admin').pipe(map(t => {
      const menuItems: DataMenuItem<Media>[] = [];
      menuItems.push({
        label: t['configureMedia.addVideo'],
        data: media,
        command: (event) => this.showAddMediaVideoDialog(event.item.data)
      });
      if (media.type === MediaType.MOVIE) {
        // Movie menu
        menuItems.push(
          {
            label: t['configureMedia.addSubtitle'],
            data: media,
            command: (event) => this.showAddSubtitleDialog(event.item.data)
          },
          {
            label: t['configureMedia.addSource'],
            data: media,
            disabled: media.movie.status !== MediaSourceStatus.PENDING || this.queueUploadService.isMediaInQueue(media._id),
            command: (event) => this.showAddSourceDialog(event.item.data)
          }
        );
      } else {
        // TV Menu
        menuItems.push(
          {
            label: t['configureMedia.addEpisode'],
            data: media,
            command: (event) => this.showDeleteMediaDialog(event.item.data)
          }
        );
      }
      menuItems.push(
        { separator: true },
        {
          label: t['configureMedia.deleteMedia'],
          icon: 'ms ms-delete',
          data: media,
          disabled: media.pStatus === MediaPStatus.PROCESSING,
          command: (event) => this.showDeleteMediaDialog(event.item.data)
        }
      );
      return menuItems;
    }), first());
  }

  trackId(index: number, item: any): any {
    return item?._id;
  }

  ngOnDestroy(): void {
    this.wsService.leaveRoom(SocketRoom.ADMIN_MEDIA_LIST);
    this.dialogService.dialogComponentRefMap.forEach(dialogRef => {
      dialogRef.instance.close();
    });
  }

}
