import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { first } from 'rxjs';
import { escape } from 'lodash';

import { MediaService } from '../../../../core/services';
import { Media, Paginated } from '../../../../core/models';
import { PaginateMediaDto } from '../../../../core/dto/media';
import { CreateMediaComponent } from '../../dialogs/create-media';
import { ViewMediaComponent } from '../../dialogs/view-media';
import { ConfigureMediaComponent } from '../../dialogs/configure-media';
import { UpdateMediaComponent } from '../../dialogs/update-media';
import { MediaStatus, MediaType } from '../../../../core/enums';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MediaService]
})
export class MediaComponent implements OnInit {
  MediaType = MediaType;
  MediaStatus = MediaStatus;

  @ViewChild('mediaTable') mediaTable?: Table;
  loadingMediaList: boolean = false;
  rowsPerPage: number = 10;
  mediaList?: Paginated<Media>;

  constructor(private ref: ChangeDetectorRef, private route: ActivatedRoute, private router: Router,
    public dialogService: DialogService, private confirmationService: ConfirmationService, private mediaService: MediaService) { }

  ngOnInit(): void {

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
      if (this.mediaTable.filters['title'] && !Array.isArray(this.mediaTable.filters['title'])) {
        (params.search = this.mediaTable.filters['title'].value);
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
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
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

  showDeleteMediaDialog(media: Media): void {
    const safeMediaTitle = escape(media.title);
    this.confirmationService.confirm({
      key: 'default',
      message: `Are you sure you want to delete <strong>${safeMediaTitle}</strong>? This action cannot be undone.`,
      header: 'Delete Media',
      icon: 'pi pi-info-circle',
      defaultFocus: 'none',
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
    element.disabled = true;
    this.mediaService.uploadPoster(media._id, element.files[0]).subscribe({
      next: () => this.loadMedia()
    }).add(() => {
      if (document.body.contains(element)) {
        element.disabled = false;
        this.ref.markForCheck();
      }
    });
  }

  deletePoster(media: Media, event: Event) {
    const safeMediaTitle = escape(media.title);
    this.confirmationService.confirm({
      key: 'default',
      message: `Are you sure you want to delete <strong>${safeMediaTitle}'s poster</strong>? This action cannot be undone.`,
      header: 'Delete Poster',
      icon: 'pi pi-info-circle',
      defaultFocus: 'none',
      accept: () => {
        const element = <HTMLButtonElement>event.target;
        element.disabled = true;
        this.ref.markForCheck();
        this.mediaService.deletePoster(media._id).subscribe().add(() => {
          element.disabled = true;
          this.loadMedia();
        });
      }
    });
  }

  uploadBackdrop(media: Media, event: Event) {
    const element = <HTMLInputElement>event.target;
    if (!element.files?.length) return;
    element.disabled = true;
    this.mediaService.uploadBackdrop(media._id, element.files[0]).subscribe({
      next: () => this.loadMedia()
    }).add(() => {
      if (document.body.contains(element)) {
        element.disabled = false;
        this.ref.markForCheck();
      }
    });
  }

  deleteBackdrop(media: Media, event: Event) {
    const safeMediaTitle = escape(media.title);
    this.confirmationService.confirm({
      key: 'default',
      message: `Are you sure you want to delete <strong>${safeMediaTitle}'s backdrop</strong>? This action cannot be undone.`,
      header: 'Delete Backdrop',
      icon: 'pi pi-info-circle',
      defaultFocus: 'none',
      accept: () => {
        const element = <HTMLButtonElement>event.target;
        element.disabled = true;
        this.ref.markForCheck();
        this.mediaService.deleteBackdrop(media._id).subscribe().add(() => {
          element.disabled = true;
          this.loadMedia();
        });
      }
    });
  }

  trackId(index: number, item: any): any {
    return item?._id;
  }

}
