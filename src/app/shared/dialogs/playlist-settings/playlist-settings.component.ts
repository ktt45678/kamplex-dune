import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { TranslocoService, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, first, forkJoin, map, of, takeUntil } from 'rxjs';
import { isEqual } from 'lodash-es';

import { ImageEditorComponent } from '../image-editor';
import { Playlist, PlaylistDetails } from '../../../core/models';
import { DestroyService, PlaylistsService } from '../../../core/services';
import {
  IMAGE_PREVIEW_SIZE, UPLOAD_PLAYLIST_THUMBNAIL_MIN_HEIGHT, UPLOAD_PLAYLIST_THUMBNAIL_MIN_WIDTH,
  UPLOAD_PLAYLIST_THUMBNAIL_RATIO, UPLOAD_PLAYLIST_THUMBNAIL_SIZE, UPLOAD_PLAYLIST_THUMBNAIL_TYPES
} from '../../../../environments/config';
import { AppErrorCode } from '../../../core/enums';
import { dataURItoFile, fixNestedDialogFocus } from '../../../core/utils';
import { UpdatePlaylistDto } from '../../../core/dto/playlists';

interface UpdatePlaylistForm {
  name: FormControl<string>;
  description: FormControl<string | null>;
  visibility: FormControl<number>;
}

@Component({
  selector: 'app-playlist-settings',
  templateUrl: './playlist-settings.component.html',
  styleUrls: ['./playlist-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DestroyService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'common'
    }
  ]
})
export class PlaylistSettingsComponent implements OnInit {
  @ViewChild('updatePlaylistFormEl') updatePlaylistFormEl?: NgForm;
  loadingPlaylist: boolean = false;
  willRemoveThumbnail: boolean = false;
  isSubmitting: boolean = false;
  playlist?: PlaylistDetails;
  updatePlaylistForm: FormGroup<UpdatePlaylistForm>;
  thumbnailPreviewName?: string;
  thumbnailPreviewUri?: string;

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private translocoService: TranslocoService, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig<Playlist>,
    private dialogService: DialogService, private playlistService: PlaylistsService, private destroyService: DestroyService) {
    this.updatePlaylistForm = new FormGroup<UpdatePlaylistForm>({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
      description: new FormControl(null, { validators: Validators.maxLength(2000) }),
      visibility: new FormControl(1, { nonNullable: true, validators: Validators.required })
    });
  }

  ngOnInit(): void {
    this.loadPlaylist();
  }

  loadPlaylist(): void {
    if (!this.config.data) return;
    const playlistId = this.config.data._id;
    this.loadingPlaylist = true;
    this.playlistService.findOne(playlistId).subscribe(playlist => {
      this.playlist = playlist;
      this.patchUpdatePlaylistForm(playlist);
    }).add(() => {
      this.loadingPlaylist = false;
      this.ref.markForCheck();
    });
  }

  patchUpdatePlaylistForm(playlist: PlaylistDetails): void {
    this.updatePlaylistForm.patchValue({
      name: playlist.name,
      description: playlist.description,
      visibility: playlist.visibility
    });
  }

  onFileDropped(file: File): void {
    this.handleThumbnailFile(file);
  }

  onInputThumbnailChange(event: Event): void {
    const element = <HTMLInputElement>event.target;
    if (!element.files?.length || !this.playlist) return;
    this.handleThumbnailFile(element.files[0]);
  }

  handleThumbnailFile(file: File): void {
    if (!UPLOAD_PLAYLIST_THUMBNAIL_TYPES.includes(file.type))
      throw new Error(AppErrorCode.UPLOAD_PLAYLIST_THUMBNAIL_UNSUPORTED);
    if (file.size > IMAGE_PREVIEW_SIZE)
      throw new Error(AppErrorCode.UPLOAD_PLAYLIST_THUMBNAIL_TOO_LARGE);
    const dialogRef = this.dialogService.open(ImageEditorComponent, {
      data: {
        aspectRatioWidth: UPLOAD_PLAYLIST_THUMBNAIL_RATIO[0], aspectRatioHeight: UPLOAD_PLAYLIST_THUMBNAIL_RATIO[1],
        minWidth: UPLOAD_PLAYLIST_THUMBNAIL_MIN_WIDTH, minHeight: UPLOAD_PLAYLIST_THUMBNAIL_MIN_HEIGHT,
        imageFile: file, maxSize: UPLOAD_PLAYLIST_THUMBNAIL_SIZE
      },
      header: this.translocoService.translate('common.imageEditor.header'),
      width: '700px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm'
    });
    dialogRef.onClose.pipe(first()).subscribe((result: string[] | null) => {
      if (!result) return;
      const [previewUri, name] = result;
      this.thumbnailPreviewName = name;
      this.thumbnailPreviewUri = previewUri;
      // Stop removing thumbnail
      this.willRemoveThumbnail = false;
      this.ref.markForCheck();
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  onRemoveThumbnail(): void {
    this.willRemoveThumbnail = true;
    // Stop changing thumbnail
    this.onUpdateThumbnailCancel();
  }

  onUpdateThumbnailCancel(): void {
    this.thumbnailPreviewName = undefined;
    this.thumbnailPreviewUri = undefined;
  }

  updateThumbnail(playlistId: string) {
    if (!this.thumbnailPreviewName) return of(null);
    const thumbnailFile = dataURItoFile(this.thumbnailPreviewUri!, this.thumbnailPreviewName);
    return this.playlistService.uploadThumbnail(playlistId, thumbnailFile);
  }

  removeThumbnail(playlistId: string) {
    if (!this.willRemoveThumbnail) return of(null);
    return this.playlistService.deleteThumbnail(playlistId).pipe(map(() => true));
  }

  updatePlaylist(playlistId: string) {
    if (isEqual(this.updatePlaylistForm.value, {
      name: this.playlist!.name,
      description: this.playlist!.description,
      visibility: this.playlist!.visibility
    })) return of(null);
    this.updatePlaylistForm.disable({ emitEvent: false });
    const formValue = this.updatePlaylistForm.getRawValue();
    const updatePlaylistDto: UpdatePlaylistDto = {
      name: formValue.name,
      description: formValue.description,
      visibility: formValue.visibility
    };
    return this.playlistService.update(playlistId, updatePlaylistDto).pipe(finalize(() => {
      this.updatePlaylistForm.enable({ emitEvent: false });
    }));
  }

  onSubmit(): void {
    if (!this.playlist) return;
    this.updatePlaylistFormEl?.ngSubmit.emit();
    if (this.updatePlaylistForm.invalid) return;
    this.isSubmitting = true;
    const operations = {
      updateThumbnailResult: this.updateThumbnail(this.playlist._id),
      removeThumbnailResult: this.removeThumbnail(this.playlist._id),
      updatePlaylistResult: this.updatePlaylist(this.playlist._id)
    }
    forkJoin(operations).pipe(takeUntil(this.destroyService))
      .subscribe(({ updateThumbnailResult, removeThumbnailResult, updatePlaylistResult }) => {
        if (updatePlaylistResult)
          this.playlist = { ...this.playlist, ...updatePlaylistResult };
        if (updateThumbnailResult) {
          this.playlist = { ...this.playlist, ...updateThumbnailResult };
          this.onUpdateThumbnailCancel();
        }
        if (removeThumbnailResult) {
          this.playlist = {
            ...this.playlist!,
            thumbnailUrl: undefined, thumbnailThumbnailUrl: undefined, smallThumbnailUrl: undefined, fullThumbnailUrl: undefined,
            thumbnailColor: undefined, thumbnailPlaceholder: undefined
          };
        }
        this.dialogRef.close(this.playlist);
      }).add(() => {
        this.isSubmitting = false;
        this.ref.markForCheck();
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
