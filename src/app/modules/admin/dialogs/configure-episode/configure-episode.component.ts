import { DOCUMENT } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, Inject, ChangeDetectorRef, Renderer2, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslocoService, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { first, map, switchMap, takeUntil } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { Source, SourceInfo, Track } from 'plyr';

import { DropdownOptionDto, UpdateTVEpisodeDto } from '../../../../core/dto/media';
import { DestroyService, ItemDataService, MediaService, QueueUploadService } from '../../../../core/services';
import { fileExtension, maxFileSize, shortDate } from '../../../../core/validators';
import { MediaDetails, MediaSubtitle, TVEpisodeDetails } from '../../../../core/models';
import { AddSubtitleForm, ShortDateForm } from '../../../../core/interfaces/forms';
import { FileUploadComponent } from '../../../../shared/components/file-upload';
import { AddSubtitleComponent } from '../add-subtitle';
import { ImageEditorComponent } from '../../../../shared/dialogs/image-editor';
import { AppErrorCode, MediaSourceStatus } from '../../../../core/enums';
import { dataURItoBlob, translocoEscape, fixNestedDialogFocus, replaceDialogHideMethod, detectFormChange } from '../../../../core/utils';
import {
  IMAGE_PREVIEW_SIZE, UPLOAD_STILL_ASPECT_HEIGHT, UPLOAD_STILL_ASPECT_WIDTH, UPLOAD_STILL_MIN_HEIGHT,
  UPLOAD_STILL_MIN_WIDTH, UPLOAD_STILL_SIZE, UPLOAD_SUBTITLE_EXT, UPLOAD_SUBTITLE_SIZE
} from '../../../../../environments/config';
import { ExtStreamSelected } from '../../../../core/interfaces/events';


interface UpdateEpisodeForm {
  episodeNumber: FormControl<number>;
  name: FormControl<string>;
  overview: FormControl<string>;
  runtime: FormControl<number | null>;
  airDate: FormGroup<ShortDateForm>;
  visibility: FormControl<number>;
  translate: FormControl<string>;
}

@Component({
  selector: 'app-configure-episode',
  templateUrl: './configure-episode.component.html',
  styleUrls: ['./configure-episode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ItemDataService,
    DestroyService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media',
      multi: true
    },
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'languages',
      multi: true
    }
  ]
})
export class ConfigureEpisodeComponent implements OnInit, AfterViewInit {
  @ViewChild('subtitleFileUpload') subtitleFileUpload?: FileUploadComponent;
  MediaSourceStatus = MediaSourceStatus;
  loadingEpisode: boolean = false;
  episode?: TVEpisodeDetails;
  previewSource?: SourceInfo;
  updateEpisodeForm: FormGroup<UpdateEpisodeForm>;
  addSubtitleLanguages?: DropdownOptionDto[];
  addSubtitleForm: FormGroup<AddSubtitleForm>;
  updateEpisodeInitValue = {};
  updateEpisodeFormChanged: boolean = false;
  isUpdatingStill: boolean = false;
  isUpdated: boolean = false;
  isUploadingSource: boolean = false;
  showEpisodePlayer: boolean = false;
  stillPreviewName?: string;
  stillPreviewUri?: string;
  days: DropdownOptionDto[] = [];
  months: DropdownOptionDto[] = [];
  years: DropdownOptionDto[] = [];
  languages: DropdownOptionDto[] = [];

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig<{ media: MediaDetails, episode: TVEpisodeDetails }>,
    private dialogService: DialogService, private confirmationService: ConfirmationService, private mediaService: MediaService,
    private itemDataService: ItemDataService, private queueUploadService: QueueUploadService,
    private translocoService: TranslocoService, private destroyService: DestroyService) {
    const lang = this.translocoService.getActiveLang();
    this.addSubtitleForm = new FormGroup<AddSubtitleForm>({
      language: new FormControl(lang, Validators.required),
      file: new FormControl(null, [Validators.required, maxFileSize(UPLOAD_SUBTITLE_SIZE), fileExtension(UPLOAD_SUBTITLE_EXT)])
    }, { updateOn: 'change' });
    this.updateEpisodeForm = new FormGroup<UpdateEpisodeForm>({
      episodeNumber: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(10000)] }),
      name: new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) }),
      overview: new FormControl('', { nonNullable: true, validators: [Validators.minLength(10), Validators.maxLength(2000)] }),
      runtime: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(10000)]),
      airDate: new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, { validators: shortDate('day', 'month', 'year', true), updateOn: 'change' }),
      visibility: new FormControl(1, { nonNullable: true, validators: Validators.required }),
      translate: new FormControl(lang, { nonNullable: true })
    }, { updateOn: 'change' });
  }

  ngOnInit(): void {
    this.loadEpisode();
    this.days = this.itemDataService.createDateList();
    this.months = this.itemDataService.createMonthList();
    this.years = this.itemDataService.createYearList();
    this.itemDataService.createLanguageList().subscribe(languages => this.languages = languages);
  }

  ngAfterViewInit(): void {
    replaceDialogHideMethod(this.dialogService, () => {
      this.closeDialog();
    }, this.dialogRef);
  }

  loadEpisode(): void {
    if (!this.config.data) return;
    const mediaId = this.config.data!.media._id;
    const episodeId = this.config.data!.episode._id;
    this.loadingEpisode = true;
    this.mediaService.findOneTVEpisode(mediaId, episodeId).subscribe(episode => {
      this.episode = episode;
      this.patchUpdateEpisodeForm(episode);
      this.loadSubtitleFormData(episode);
    }).add(() => {
      this.loadingEpisode = false;
      this.ref.markForCheck();
    });
  }

  onUpdateEpisodeFormSubmit(): void {
    if (this.updateEpisodeForm.invalid) return;
    const mediaId = this.config.data!.media._id;
    const episodeId = this.config.data!.episode._id;
    this.updateEpisodeForm.disable({ emitEvent: false });
    const formValue = this.updateEpisodeForm.getRawValue();
    const updateTVEpisodeDto: UpdateTVEpisodeDto = ({
      episodeNumber: formValue.episodeNumber,
      name: formValue.name,
      overview: formValue.overview,
      runtime: formValue.runtime!,
      airDate: {
        day: formValue.airDate.day!,
        month: formValue.airDate.month!,
        year: formValue.airDate.year!
      },
      visibility: formValue.visibility
    });
    this.mediaService.updateTVEpisode(mediaId, episodeId, updateTVEpisodeDto).pipe(takeUntil(this.destroyService)).subscribe({
      next: (episode) => {
        this.episode = episode;
        this.updateEpisodeInitValue = cloneDeep(this.updateEpisodeForm.value);
        detectFormChange(this.updateEpisodeForm, this.updateEpisodeInitValue, () => {
          this.updateEpisodeFormChanged = false;
        }, () => {
          this.updateEpisodeFormChanged = true;
        }).pipe(takeUntil(this.destroyService)).subscribe();
        this.isUpdated = true;
      }
    }).add(() => {
      this.updateEpisodeForm.enable({ emitEvent: false });
      this.ref.markForCheck();
    });
  }

  onUpdateEpisodeFormReset(): void {
    this.updateEpisodeForm.reset(this.updateEpisodeInitValue);
    detectFormChange(this.updateEpisodeForm, this.updateEpisodeInitValue, () => {
      this.updateEpisodeFormChanged = false;
    }, () => {
      this.updateEpisodeFormChanged = true;
    }).pipe(takeUntil(this.destroyService)).subscribe();
  }

  onInputStillChange(event: Event): void {
    const element = <HTMLInputElement>event.target;
    if (!element.files?.length || !this.episode) return;
    if (element.files[0].size > IMAGE_PREVIEW_SIZE)
      throw new Error(AppErrorCode.UPLOAD_STILL_TOO_LARGE);
    const dialogRef = this.dialogService.open(ImageEditorComponent, {
      data: {
        aspectRatioWidth: UPLOAD_STILL_ASPECT_WIDTH, aspectRatioHeight: UPLOAD_STILL_ASPECT_HEIGHT,
        minWidth: UPLOAD_STILL_MIN_WIDTH, minHeight: UPLOAD_STILL_MIN_HEIGHT,
        imageFile: element.files[0], maxSize: UPLOAD_STILL_SIZE
      },
      header: this.translocoService.translate('admin.configureMedia.editImage'),
      width: '700px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm'
    });
    dialogRef.onClose.pipe(first()).subscribe((result: string[] | null) => {
      if (!result) return;
      const [previewUri, name] = result;
      this.stillPreviewName = name;
      this.stillPreviewUri = previewUri;
      this.ref.markForCheck();
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  onUpdateStillSubmit(): void {
    if (!this.stillPreviewName) return;
    this.isUpdatingStill = true;
    const mediaId = this.config.data!.media._id;
    const episodeId = this.config.data!.episode._id;
    const stillBlob = dataURItoBlob(this.stillPreviewUri!);
    this.mediaService.uploadStill(mediaId, episodeId, stillBlob, this.stillPreviewName).subscribe({
      next: (paritalEpisode) => {
        this.stillPreviewName = undefined;
        this.stillPreviewUri = undefined;
        if (!this.episode) return;
        this.episode = { ...this.episode, ...paritalEpisode };
        this.isUpdated = true;
      }
    }).add(() => {
      this.isUpdatingStill = false;
      this.ref.markForCheck();
    });
  }

  onUpdateStillCancel(): void {
    this.stillPreviewName = undefined;
    this.stillPreviewUri = undefined;
    this.ref.markForCheck();
  }

  patchUpdateEpisodeForm(episode: TVEpisodeDetails): void {
    this.updateEpisodeForm.patchValue({
      episodeNumber: episode.episodeNumber,
      name: episode.name,
      overview: episode.overview || '',
      runtime: episode.runtime,
      airDate: {
        day: episode.airDate.day,
        month: episode.airDate.month,
        year: episode.airDate.year
      },
      visibility: episode.visibility
    });
    this.updateEpisodeInitValue = cloneDeep(this.updateEpisodeForm.value);
    detectFormChange(this.updateEpisodeForm, this.updateEpisodeInitValue, () => {
      this.updateEpisodeFormChanged = false;
    }, () => {
      this.updateEpisodeFormChanged = true;
    }).pipe(takeUntil(this.destroyService)).subscribe();
  }

  loadSubtitleFormData(episode: TVEpisodeDetails): void {
    const disabledLanguages = episode.subtitles.map((s: MediaSubtitle) => s.language);
    this.itemDataService.createLanguageList(disabledLanguages).subscribe({
      next: languages => this.addSubtitleLanguages = languages
    });
  }

  showAddSubtitleDialog(file: File): void {
    if (!this.episode) return;
    if (file.size > UPLOAD_SUBTITLE_SIZE)
      throw new Error(AppErrorCode.UPLOAD_SUBTITLE_TOO_LARGE);
    this.subtitleFileUpload?.clear();
    const media = this.config.data!.media;
    const dialogRef = this.dialogService.open(AddSubtitleComponent, {
      data: { media: { ...media }, episode: { ...this.episode }, file },
      width: '500px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    dialogRef.onClose.pipe(first()).subscribe((subtitles: MediaSubtitle[]) => {
      if (!subtitles || !this.episode) return;
      this.episode = { ...this.episode, subtitles };
      this.ref.markForCheck();
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  deleteSubtitle(subtitle: MediaSubtitle, event: Event): void {
    const mediaId = this.config.data!.media._id;
    const episodeId = this.config.data!.episode._id;
    this.confirmationService.confirm({
      key: 'inModalEpisode',
      message: this.translocoService.translate('admin.media.deleteSubtitleConfirmation'),
      header: this.translocoService.translate('admin.media.deleteSubtitleConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => {
        const element = event.target instanceof HTMLButtonElement ? event.target : <HTMLButtonElement>(<HTMLSpanElement>event.target).parentElement;
        this.renderer.setProperty(element, 'disabled', true);
        this.mediaService.deleteTVSubtitle(mediaId, episodeId, subtitle._id).subscribe({
          next: () => {
            if (!this.episode) return;
            const subtitles = this.episode.subtitles.filter(v => v._id !== subtitle._id);
            this.episode = { ...this.episode, subtitles };
          },
          error: () => {
            this.renderer.setProperty(element, 'disabled', false);
          }
        }).add(() => this.ref.markForCheck());
      }
    });
  }

  checkUploadInQueue(): void {
    const mediaId = this.config.data!.media._id;
    const episodeId = this.config.data!.episode._id;
    this.isUploadingSource = this.queueUploadService.isMediaInQueue(`${mediaId}:${episodeId}`);
  }

  uploadSource(file: File): void {
    const mediaId = this.config.data!.media._id;
    const episodeId = this.config.data!.episode._id;
    this.queueUploadService.addToQueue(`${mediaId}:${episodeId}`, file, `media/${mediaId}/tv/episodes/${episodeId}/source`, `media/${mediaId}/tv/episodes/${episodeId}/source/:id`);
    this.isUploadingSource = true;
    this.ref.markForCheck();
  }

  showSourcePreview(): void {
    this.showEpisodePlayer = true;
    const mediaId = this.config.data!.media._id;
    const episodeNumber = this.config.data!.episode.episodeNumber;
    this.translocoService.selectTranslation('languages').pipe(first(), switchMap(t => {
      return this.mediaService.findTVStreams(mediaId, episodeNumber).pipe(map(movie => ({ movie, t })));
    })).subscribe(({ movie, t }) => {
      const sources: Source[] = [];
      const tracks: Track[] = [];
      const selectedCodec = 1;
      movie.streams.forEach(stream => {
        if (stream.codec === selectedCodec) {
          sources.push({
            src: stream.src,
            type: stream.mimeType,
            provider: 'html5',
            size: stream.quality
          });
        }
      });
      movie.subtitles.forEach(subtitle => {
        tracks.push({
          kind: 'subtitles',
          label: t[subtitle.language],
          srcLang: subtitle.language,
          src: subtitle.src
        });
      });
      this.previewSource = {
        type: 'video',
        sources: sources,
        tracks: tracks
      };
    });
  }

  deleteSource(event: Event): void {
    const mediaId = this.config.data!.media._id;
    const episodeId = this.config.data!.episode._id;
    const safeEpisodeName = translocoEscape(this.config.data!.episode.episodeNumber.toString());
    this.confirmationService.confirm({
      key: 'inModalEpisode',
      message: this.translocoService.translate('admin.media.deleteSourceConfirmation', { name: safeEpisodeName }),
      header: this.translocoService.translate('admin.media.deleteSourceConfirmationHeader'),
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      accept: () => {
        const element = event.target instanceof HTMLButtonElement ? event.target : <HTMLButtonElement>(<HTMLSpanElement>event.target).parentElement;
        this.renderer.setProperty(element, 'disabled', true);
        this.mediaService.deleteTVSource(mediaId, episodeId).subscribe({
          next: () => {
            if (!this.episode) return;
            this.episode = { ...this.episode, status: MediaSourceStatus.PENDING };
            this.isUpdated = true;
          }
        }).add(() => {
          this.renderer.setProperty(element, 'disabled', false);
          this.ref.markForCheck();
        });
      }
    });
  }

  updateExtStreams(event: ExtStreamSelected): void {
    const mediaId = this.config.data!.media._id;
    const episodeId = this.config.data!.episode._id;
    this.mediaService.updateTVEpisode(mediaId, episodeId, { extStreams: event.streams }).subscribe({
      next: () => event.next(),
      error: () => event.error()
    });
  }

  trackId(index: number, item: any): any {
    return item?._id;
  }

  closeDialog(): void {
    this.dialogRef.close(this.isUpdated);
  }

}
