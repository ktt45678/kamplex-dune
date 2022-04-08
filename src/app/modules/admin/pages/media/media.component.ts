import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Menu } from 'primeng/menu';
import { first, of, tap } from 'rxjs';
import { escape } from 'lodash';

import { MediaService } from '../../../../core/services';
import { Media, MediaDetails, Paginated } from '../../../../core/models';
import { PaginateMediaDto } from '../../../../core/dto/media';
import { DataMenuItem } from '../../../../core/interfaces/primeng';
import { CreateMediaComponent } from '../../dialogs/create-media';
import { ViewMediaComponent } from '../../dialogs/view-media';
import { ConfigureMediaComponent } from '../../dialogs/configure-media';
import { UpdateMediaComponent } from '../../dialogs/update-media';
import { MediaStatus, MediaType } from '../../../../core/enums';
import { AddVideoComponent } from '../../dialogs/add-video';
import { AddSubtitleComponent } from '../../dialogs/add-subtitle';
import { AddSourceComponent } from '../../dialogs/add-source';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaComponent implements OnInit {
  MediaType = MediaType;
  MediaStatus = MediaStatus;

  @ViewChild('mediaTable') mediaTable?: Table;
  loadingMediaList: boolean = false;
  rowsPerPage: number = 10;
  mediaList?: Paginated<Media>;
  cachedMediaDetails?: MediaDetails;
  movieMenuItems: DataMenuItem<Media>[] = [];
  tvMenuItems: DataMenuItem<Media>[] = [];

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private route: ActivatedRoute, private router: Router, public dialogService: DialogService,
    private confirmationService: ConfirmationService, private mediaService: MediaService,
    private translocoService: TranslocoService) { }

  ngOnInit(): void {
    this.createMediaMenuItem();
  }

  loadMedia(): void {
    const params = new PaginateMediaDto();
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
    this.loadingMediaList = true;
    this.mediaService.findPage(params).subscribe({
      next: (mediaList) => {
        this.mediaList = mediaList;
        this.ref.markForCheck();
      }
    }).add(() => this.loadingMediaList = false);
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
      contentStyle: { 'margin-top': '-1.5rem', 'overflow-y': 'hidden', 'padding': '0px' },
      dismissableMask: false
    });
    dialogRef.onClose.pipe(first()).subscribe((result: boolean) => {
      if (!result) return;
      this.loadMedia();
    });
  }

  showViewMediaDialog(media: Media): void {
    this.dialogService.open(ViewMediaComponent, {
      data: media,
      width: '1024px',
      modal: true,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
  }

  showConfigureMediaDialog(media: Media): void {
    this.dialogService.open(ConfigureMediaComponent, {
      data: media,
      width: '100%',
      height: '100%',
      modal: true,
      showHeader: false,
      styleClass: 'p-dialog-header-sm !tw-max-h-full'
    });
  }

  showUpdateMediaDialog(media: Media): void {
    const dialogRef = this.dialogService.open(UpdateMediaComponent, {
      data: media,
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
        data: mediaDetails,
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
        data: mediaDetails,
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
        data: mediaDetails,
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
        this.ref.markForCheck();
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
        this.ref.markForCheck();
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
        this.ref.markForCheck();
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
        this.ref.markForCheck();
        this.mediaService.deleteBackdrop(media._id).subscribe().add(() => {
          this.renderer.setProperty(element, 'disabled', false);
          this.loadMedia();
        });
      }
    });
  }

  toggleMediaMenu(menu: Menu, event: Event, media: Media): void {
    if (!menu.visible) {
      const menuItems = media.type === MediaType.MOVIE ? this.movieMenuItems : this.tvMenuItems;
      menuItems.forEach(item => {
        item.data = media;
        if (item.id === 'addSource' && media.pStatus !== MediaStatus.PENDING)
          item.disabled = true;
        else if (item.id === 'delete' && media.pStatus === MediaStatus.PROCESSING)
          item.disabled = true;
      });
    }
    menu.toggle(event);
  }

  createMediaMenuItem(): void {
    this.translocoService.selectTranslation('admin').pipe(first()).subscribe(t => {
      const addVideo: DataMenuItem<Media> = {
        label: t['configureMedia.addVideo'],
        command: (event) => this.showAddMediaVideoDialog(event.item.data)
      };
      const addSubtitle: DataMenuItem<Media> = {
        label: t['configureMedia.addSubtitle'],
        command: (event) => this.showAddSubtitleDialog(event.item.data)
      };
      const addSource: DataMenuItem<Media> = {
        id: 'addSource',
        label: t['configureMedia.addSource'],
        command: (event) => this.showAddSourceDialog(event.item.data)
      };
      const addEpisode: DataMenuItem<Media> = {
        label: t['configureMedia.addEpisode'],
        command: (event) => this.showDeleteMediaDialog(event.item.data)
      };
      const deleteMedia: DataMenuItem<Media> = {
        id: 'delete',
        label: t['configureMedia.deleteMedia'],
        icon: 'pi pi-trash',
        command: (event) => this.showDeleteMediaDialog(event.item.data)
      };
      const separator: DataMenuItem<Media> = { separator: true };
      this.movieMenuItems = [addVideo, addSubtitle, addSource, separator, deleteMedia];
      this.tvMenuItems = [addVideo, addEpisode, separator, deleteMedia];
    });
  }

  trackId(index: number, item: any): any {
    return item?._id;
  }

}
