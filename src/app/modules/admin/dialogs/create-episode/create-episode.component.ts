import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2, ViewChild, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { addDays } from 'date-fns';
import { EMPTY, first, Observable, switchMap, takeUntil, takeWhile, tap } from 'rxjs';
import { cloneDeep, isEqual } from 'lodash';

import { AddSubtitleComponent } from '../add-subtitle';
import { StepperComponent } from '../../../../shared/components/stepper';
import { FileUploadComponent } from '../../../../shared/components/file-upload';
import { ImageEditorComponent } from '../../../../shared/dialogs/image-editor';
import { AddTVEpisodeDto, DropdownOptionDto, UpdateTVEpisodeDto } from '../../../../core/dto/media';
import { MediaDetails, MediaSubtitle, TVEpisode, TVEpisodeDetails } from '../../../../core/models';
import { DestroyService, ItemDataService, MediaService, QueueUploadService } from '../../../../core/services';
import { shortDate } from '../../../../core/validators';
import { ShortDateForm } from '../../../../core/interfaces/forms';
import { AppErrorCode } from '../../../../core/enums';
import { dataURItoBlob, fixNestedDialogFocus, replaceDialogHideMethod } from '../../../../core/utils';
import {
  IMAGE_PREVIEW_MIMES, IMAGE_PREVIEW_SIZE, UPLOAD_STILL_ASPECT_HEIGHT, UPLOAD_STILL_ASPECT_WIDTH, UPLOAD_STILL_MIN_HEIGHT,
  UPLOAD_STILL_MIN_WIDTH, UPLOAD_STILL_SIZE, UPLOAD_SUBTITLE_SIZE
} from '../../../../../environments/config';
import { ExtStreamSelected } from '../../../../core/interfaces/events';

interface CreateEpisodeForm {
  episodeNumber: FormControl<number>;
  name: FormControl<string>;
  overview: FormControl<string>;
  runtime: FormControl<number | null>;
  airDate: FormGroup<ShortDateForm>;
  visibility: FormControl<number>;
}

interface UpdateEpisodeForm extends CreateEpisodeForm { }

@Component({
  selector: 'app-create-episode',
  templateUrl: './create-episode.component.html',
  styleUrls: ['./create-episode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class CreateEpisodeComponent implements OnInit {
  @ViewChild('stepper') stepper?: StepperComponent;
  @ViewChild('stillFileUpload') stillFileUpload?: FileUploadComponent;
  @ViewChild('subtitleFileUpload') subtitleFileUpload?: FileUploadComponent;
  createEpisodeForm: FormGroup<CreateEpisodeForm>;
  updateEpisodeForm: FormGroup<CreateEpisodeForm>;
  episode?: TVEpisodeDetails;
  hasStill: boolean = false;
  isUpdatingStill: boolean = false;
  isUploadingSource: boolean = false;
  updateEpisodeFormChanged: boolean = false;
  subtitleCount: number = 0;
  updateEpisodeInitValue: {} = {};
  days: DropdownOptionDto[] = [];
  months: DropdownOptionDto[] = [];
  years: DropdownOptionDto[] = [];
  createEpisodeCtx;
  updateEpisodeCtx;

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef,
    private dialogService: DialogService, private config: DynamicDialogConfig, private renderer: Renderer2,
    private translocoService: TranslocoService, private mediaService: MediaService, private queueUploadService: QueueUploadService,
    private itemDataService: ItemDataService, private destroyService: DestroyService) {
    // Create episode form
    this.createEpisodeForm = new FormGroup<CreateEpisodeForm>({
      episodeNumber: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(10000)] }),
      name: new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) }),
      overview: new FormControl('', { nonNullable: true, validators: [Validators.minLength(10), Validators.maxLength(2000)] }),
      runtime: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(10000)]),
      airDate: new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, { validators: shortDate('day', 'month', 'year', true) }),
      visibility: new FormControl(1, { nonNullable: true, validators: Validators.required })
    });
    // Update episode form
    this.updateEpisodeForm = new FormGroup<UpdateEpisodeForm>({
      episodeNumber: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(10000)] }),
      name: new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) }),
      overview: new FormControl('', { nonNullable: true, validators: [Validators.minLength(10), Validators.maxLength(2000)] }),
      runtime: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(10000)]),
      airDate: new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, { validators: shortDate('day', 'month', 'year', true) }),
      visibility: new FormControl(1, { nonNullable: true, validators: Validators.required })
    });
    this.createEpisodeCtx = {
      action: 'createEpisode', formGroup: this.createEpisodeForm, submitFn: () => this.onCreateEpisodeFormSubmit(),
      cancelFn: () => this.onCreateEpisodeFormCancel(), submitBtnStyle: 'p-button'
    };
    this.updateEpisodeCtx = {
      action: 'updateEpisode', formGroup: this.updateEpisodeForm, submitFn: () => this.onUpdateEpisodeFormSubmit(),
      cancelFn: () => this.onUpdateEpisodeFormReset(), submitBtnStyle: 'p-button-success'
    };
  }

  ngOnInit(): void {
    this.patchCreateEpisodeForm();
    this.days = this.itemDataService.createDateList();
    this.months = this.itemDataService.createMonthList();
    this.years = this.itemDataService.createYearList();
  }

  ngAfterViewInit(): void {
    replaceDialogHideMethod(this.dialogService, () => {
      this.closeDialog();
    }, this.dialogRef);
  }

  patchCreateEpisodeForm(): void {
    const media: MediaDetails = this.config.data['media'];
    const episodes: TVEpisode[] = this.config.data['episodes'];
    let lastAirDate: Date;
    let lastEpisodeNumber: number;
    let lastEpisodeRuntime: number;
    if (episodes.length && episodes.length >= media.tv.episodeCount) {
      // Based on last created episode
      //const lastEpisode = episodes.reduce((prev, current) => (prev.episodeNumber > current.episodeNumber) ? prev : current);
      const lastEpisode = episodes[episodes.length - 1];
      lastAirDate = new Date(lastEpisode.airDate.year, lastEpisode.airDate.month - 1, lastEpisode.airDate.day);
      lastEpisodeNumber = lastEpisode.episodeNumber;
      lastEpisodeRuntime = lastEpisode.runtime;
    } else {
      // Based on media general info
      lastAirDate = new Date(media.tv.lastAirDate.year, media.tv.lastAirDate.month - 1, media.tv.lastAirDate.day);
      lastEpisodeNumber = media.tv.episodeCount + 1;
      lastEpisodeRuntime = media.runtime;
    }
    const nextWeekDate = addDays(lastAirDate, 7);
    this.createEpisodeForm.patchValue({
      episodeNumber: lastEpisodeNumber,
      runtime: lastEpisodeRuntime,
      airDate: {
        day: nextWeekDate.getDate(),
        month: nextWeekDate.getMonth() + 1,
        year: nextWeekDate.getFullYear()
      }
    });
  }

  onCreateEpisodeFormSubmit(): void {
    if (this.createEpisodeForm.invalid) return;
    this.createEpisodeForm.disable();
    const mediaId = this.config.data['media']['_id'];
    const formValue = this.createEpisodeForm.getRawValue();
    const addTVEpisodeDto: AddTVEpisodeDto = ({
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
    this.mediaService.addTVEpisode(mediaId, addTVEpisodeDto).pipe(takeUntil(this.destroyService)).subscribe({
      next: (episode) => {
        this.episode = episode;
        this.patchUpdateMediaForm(episode);
        this.ref.markForCheck();
        this.stepper?.next();
      }
    }).add(() => {
      this.createEpisodeForm.enable();
    });
  }

  onCreateEpisodeFormCancel(): void {
    this.dialogRef.close();
  }

  patchUpdateMediaForm(episode: TVEpisodeDetails): void {
    this.updateEpisodeForm.patchValue({
      episodeNumber: episode.episodeNumber,
      name: episode.name,
      overview: episode.overview,
      runtime: episode.runtime,
      airDate: {
        day: episode.airDate.day,
        month: episode.airDate.month,
        year: episode.airDate.year
      },
      visibility: episode.visibility
    });
    this.updateEpisodeInitValue = cloneDeep(this.updateEpisodeForm.value);
    this.detectFormChange(this.updateEpisodeForm, this.updateEpisodeInitValue, this.updateEpisodeFormChanged);
  }

  detectFormChange(form: FormGroup, initValue: any, isChanged: boolean): void {
    isChanged = false;
    form.valueChanges.pipe(
      tap(() => {
        const formChanged = !isEqual(form.value, initValue);
        isChanged = formChanged;
      }),
      takeWhile(() => !isChanged),
      takeUntil(this.destroyService)
    ).subscribe();
  }

  onUpdateEpisodeFormSubmit(): void {
    if (!this.episode || this.updateEpisodeForm.invalid) return;
    this.updateEpisodeForm.disable();
    const mediaId = this.config.data['media']['_id'];
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
    this.mediaService.updateTVEpisode(mediaId, this.episode._id, updateTVEpisodeDto).pipe(takeUntil(this.destroyService)).subscribe({
      next: (episode) => {
        this.episode = episode;
        this.updateEpisodeInitValue = cloneDeep(this.updateEpisodeForm.value);
        this.detectFormChange(this.updateEpisodeForm, this.updateEpisodeInitValue, this.updateEpisodeFormChanged);
        this.ref.markForCheck();
      }
    }).add(() => {
      this.updateEpisodeForm.enable();
    });
  }

  onUpdateEpisodeFormReset(): void {
    this.updateEpisodeForm.reset(this.updateEpisodeInitValue);
    this.detectFormChange(this.updateEpisodeForm, this.updateEpisodeInitValue, this.updateEpisodeFormChanged);
  }

  onInputStillChange(file: File): void {
    if (!this.episode) return;
    if (file.size > IMAGE_PREVIEW_SIZE)
      throw new Error(AppErrorCode.UPLOAD_STILL_TOO_LARGE);
    if (!IMAGE_PREVIEW_MIMES.includes(file.type))
      throw new Error(AppErrorCode.UPLOAD_STILL_UNSUPORTED);
    const mediaId = this.config.data['media']['_id'];
    this.editImage({
      aspectRatioWidth: UPLOAD_STILL_ASPECT_WIDTH, aspectRatioHeight: UPLOAD_STILL_ASPECT_HEIGHT,
      minWidth: UPLOAD_STILL_MIN_WIDTH, minHeight: UPLOAD_STILL_MIN_HEIGHT,
      imageFile: file, maxSize: UPLOAD_STILL_SIZE
    }).pipe(switchMap(result => {
      if (!result) return EMPTY;
      const [previewUri, name] = result;
      const stillBlob = dataURItoBlob(previewUri);
      return this.mediaService.uploadStill(mediaId, this.episode!._id, stillBlob, name);
    })).subscribe(paritalEpisode => {
      this.stillFileUpload?.clear();
      this.episode = { ...this.episode, ...paritalEpisode };
      this.hasStill = true;
      this.ref.markForCheck();
    });
  }

  editImage(data: any): Observable<string[] | null> {
    const dialogRef = this.dialogService.open(ImageEditorComponent, {
      data: data,
      header: this.translocoService.translate('admin.configureMedia.editImage'),
      width: '700px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm'
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
    return dialogRef.onClose.pipe(first());
  }

  showAddSubtitleDialog(file?: File): void {
    if (!this.episode) return;
    if (file && file.size > UPLOAD_SUBTITLE_SIZE)
      throw new Error(AppErrorCode.UPLOAD_SUBTITLE_TOO_LARGE);
    this.subtitleFileUpload?.clear();
    const media = this.config.data['media'];
    const dialogRef = this.dialogService.open(AddSubtitleComponent, {
      data: { media: { ...media }, episode: { ...this.episode }, file: file },
      width: '500px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    dialogRef.onClose.pipe(first()).subscribe((subtitles: MediaSubtitle[]) => {
      if (!subtitles || !this.episode) return;
      this.episode.subtitles = subtitles;
      this.subtitleCount++;
      this.ref.markForCheck();
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  uploadSource(file: File): void {
    if (!this.episode) return;
    const mediaId = this.config.data['media']['_id'];
    const episodeId = this.config.data['episode']['_id'];
    this.queueUploadService.addToQueue(`${mediaId}:${episodeId}`, file, `media/${mediaId}/tv/episodes/${episodeId}/source`, `media/${mediaId}/tv/episodes/${episodeId}/source/:id`);
    this.isUploadingSource = true;
  }

  updateExtStreams(event: ExtStreamSelected): void {
    if (!this.episode) return;
    const mediaId = this.config.data['media']['_id'];
    this.mediaService.updateTVEpisode(mediaId, this.episode._id, { extStreams: event.streams }).subscribe({
      next: () => event.complete()
    });
  }

  closeDialog(): void {
    this.dialogRef.close(this.episode);
  }

}
