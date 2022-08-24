import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EMPTY, first, Observable, switchMap, takeUntil, takeWhile, tap } from 'rxjs';
import { cloneDeep, isEqual } from 'lodash';

import { AddVideoComponent } from '../add-video';
import { AddSubtitleComponent } from '../add-subtitle';
import { CreateEpisodeComponent } from '../create-episode';
import { StepperComponent } from '../../../../shared/components/stepper';
import { ImageEditorComponent } from '../../../../shared/dialogs/image-editor';
import { FileUploadComponent } from '../../../../shared/components/file-upload';
import { CreateMediaDto, DropdownOptionDto, UpdateMediaDto } from '../../../../core/dto/media';
import { AppErrorCode, MediaStatus, MediaType } from '../../../../core/enums';
import { ShortDateForm } from '../../../../core/interfaces/forms';
import { ExtStreamSelected } from '../../../../core/interfaces/events';
import { Genre, MediaDetails, MediaSubtitle, MediaVideo, Production } from '../../../../core/models';
import { DestroyService, GenresService, ItemDataService, MediaService, ProductionsService, QueueUploadService } from '../../../../core/services';
import { shortDate } from '../../../../core/validators';
import { dataURItoBlob, fixNestedDialogFocus, replaceDialogHideMethod } from '../../../../core/utils';
import {
  IMAGE_PREVIEW_MIMES, IMAGE_PREVIEW_SIZE, UPLOAD_BACKDROP_ASPECT_HEIGHT, UPLOAD_BACKDROP_ASPECT_WIDTH, UPLOAD_BACKDROP_MIN_HEIGHT,
  UPLOAD_BACKDROP_MIN_WIDTH, UPLOAD_BACKDROP_SIZE, UPLOAD_POSTER_ASPECT_HEIGHT, UPLOAD_POSTER_ASPECT_WIDTH, UPLOAD_POSTER_MIN_HEIGHT,
  UPLOAD_POSTER_MIN_WIDTH, UPLOAD_POSTER_SIZE, UPLOAD_SUBTITLE_SIZE
} from '../../../../../environments/config';

interface CreateMediaForm {
  type: FormControl<string>;
  title: FormControl<string>;
  originalTitle: FormControl<string | null>;
  overview: FormControl<string>;
  originalLanguage: FormControl<string | null>;
  genres: FormControl<Genre[] | null>;
  productions: FormControl<Production[] | null>;
  runtime: FormControl<number | null>;
  adult: FormControl<boolean>;
  releaseDate: FormGroup<ShortDateForm>;
  lastAirDate?: FormGroup<ShortDateForm>;
  visibility: FormControl<number>;
  status: FormControl<string>;
}

interface UpdateMediaForm extends Omit<CreateMediaForm, 'type'> { }

@Component({
  selector: 'app-create-media',
  templateUrl: './create-media.component.html',
  styleUrls: ['./create-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class CreateMediaComponent implements OnInit, AfterViewInit {
  @ViewChild('stepper') stepper?: StepperComponent;
  @ViewChild('posterFileUpload') posterFileUpload?: FileUploadComponent;
  @ViewChild('backdropFileUpload') backdropFileUpload?: FileUploadComponent;
  @ViewChild('subtitleFileUpload') subtitleFileUpload?: FileUploadComponent;
  MediaType = MediaType;
  media?: MediaDetails;
  hasPoster: boolean = false;
  isUpdatingPoster: boolean = false;
  hasBackdrop: boolean = false;
  isUpdatingBackdrop: boolean = false;
  updateMediaFormChanged: boolean = false;
  videoCount: number = 0;
  subtitleCount: number = 0;
  episodeCount: number = 0;
  isUploadingSource: boolean = false;
  createMediaForm: FormGroup<CreateMediaForm>;
  updateMediaForm: FormGroup<UpdateMediaForm>;
  updateMediaInitValue: {} = {};
  days: DropdownOptionDto[] = [];
  months: DropdownOptionDto[] = [];
  years: DropdownOptionDto[] = [];
  languages: DropdownOptionDto[] = [];
  genreSuggestions: Genre[] = [];
  productionSuggestions: Production[] = [];
  createMediaCtx;
  updateMediaCtx;

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef,
    private dialogRef: DynamicDialogRef, private dialogService: DialogService, private config: DynamicDialogConfig,
    private renderer: Renderer2, private translocoService: TranslocoService,
    private mediaService: MediaService, private genresService: GenresService, private queueUploadService: QueueUploadService,
    private productionsService: ProductionsService, private itemDataService: ItemDataService, private destroyService: DestroyService) {
    const mediaType = this.config.data['type'] || MediaType.MOVIE;
    // Create media form
    this.createMediaForm = new FormGroup<CreateMediaForm>({
      type: new FormControl(mediaType),
      title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] }),
      originalTitle: new FormControl(null, [Validators.maxLength(500)]),
      overview: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(2000)] }),
      originalLanguage: new FormControl(null),
      genres: new FormControl(null),
      productions: new FormControl(null),
      runtime: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(10000)]),
      adult: new FormControl(false, { nonNullable: true, validators: Validators.required }),
      releaseDate: new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, { validators: shortDate('day', 'month', 'year', true) }),
      visibility: new FormControl(1, { nonNullable: true, validators: Validators.required }),
      status: new FormControl(MediaStatus.RELEASED, { nonNullable: true, validators: Validators.required })
    });
    // Update media form
    this.updateMediaForm = new FormGroup<UpdateMediaForm>({
      title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] }),
      originalTitle: new FormControl('', [Validators.maxLength(500)]),
      overview: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(2000)] }),
      originalLanguage: new FormControl(''),
      genres: new FormControl(null),
      productions: new FormControl(null),
      runtime: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(10000)]),
      adult: new FormControl(false, { nonNullable: true, validators: Validators.required }),
      releaseDate: new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, { validators: shortDate('day', 'month', 'year', true) }),
      visibility: new FormControl(1, { nonNullable: true, validators: Validators.required }),
      status: new FormControl(MediaStatus.RELEASED, { nonNullable: true, validators: Validators.required })
    });
    if (mediaType === MediaType.TV) {
      // Add last air date control for TV Show
      this.createMediaForm.addControl('lastAirDate', new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, { validators: shortDate('day', 'month', 'year', false) }));
      this.createMediaForm.get('status')?.setValue(MediaStatus.AIRED);
      this.updateMediaForm.addControl('lastAirDate', new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, { validators: shortDate('day', 'month', 'year', false) }));
    }
    this.createMediaCtx = {
      action: 'createMedia', formGroup: this.createMediaForm, submitFn: () => this.onCreateMediaFormSubmit(),
      cancelFn: () => this.onCreateMediaFormCancel(), submitBtnStyle: 'p-button'
    };
    this.updateMediaCtx = {
      action: 'updateMedia', formGroup: this.updateMediaForm, submitFn: () => this.onUpdateMediaFormSubmit(),
      cancelFn: () => this.onUpdateMediaFormReset(), submitBtnStyle: 'p-button-success'
    };
  }

  ngOnInit(): void {
    this.days = this.itemDataService.createDateList();
    this.months = this.itemDataService.createMonthList();
    this.years = this.itemDataService.createYearList();
    this.itemDataService.createLanguageList().pipe(first()).subscribe(languages => {
      this.languages = languages
    });
  }

  ngAfterViewInit(): void {
    replaceDialogHideMethod(this.dialogService, () => {
      this.closeDialog();
    }, this.dialogRef);
  }

  loadGenreSuggestions(search?: string): void {
    this.genresService.findGenreSuggestions(search).subscribe({
      next: genres => this.genreSuggestions = genres
    }).add(() => this.ref.markForCheck());
  }

  loadProductionSuggestions(search?: string): void {
    this.productionsService.findProductionSuggestions(search).subscribe({
      next: productions => this.productionSuggestions = productions
    }).add(() => this.ref.markForCheck());
  }

  onCreateMediaFormSubmit(): void {
    if (this.createMediaForm.invalid) return;
    this.createMediaForm.disable();
    const formValue = this.createMediaForm.getRawValue();
    const genreIds = formValue.genres?.map(g => g._id) || [];
    const productionIds = formValue.productions?.map(p => p._id) || [];
    const createMediaDto: CreateMediaDto = {
      type: formValue.type,
      title: formValue.title,
      originalTitle: formValue.originalTitle || null,
      overview: formValue.overview,
      genres: genreIds,
      originalLanguage: formValue.originalLanguage,
      productions: productionIds,
      runtime: formValue.runtime!,
      adult: formValue.adult,
      releaseDate: {
        day: formValue.releaseDate.day!,
        month: formValue.releaseDate.month!,
        year: formValue.releaseDate.year!
      },
      visibility: formValue.visibility,
      status: formValue.status
    };
    if (createMediaDto.type === MediaType.TV && formValue.lastAirDate) {
      createMediaDto.lastAirDate = {
        day: formValue.lastAirDate.day!,
        month: formValue.lastAirDate.month!,
        year: formValue.lastAirDate.year!
      }
    }
    this.mediaService.create(createMediaDto).pipe(takeUntil(this.destroyService)).subscribe({
      next: (media) => {
        this.media = media;
        this.patchUpdateMediaForm(media);
        this.ref.markForCheck();
        this.stepper?.next();
      }
    }).add(() => {
      this.createMediaForm.enable();
    });
  }

  onCreateMediaFormCancel(): void {
    this.dialogRef.close(this.media);
  }

  patchUpdateMediaForm(media: MediaDetails): void {
    this.updateMediaForm.patchValue({
      title: media.title,
      originalTitle: media.originalTitle || '',
      overview: media.overview,
      originalLanguage: media.originalLanguage || null,
      genres: media.genres,
      productions: media.productions,
      runtime: media.runtime,
      adult: media.adult,
      releaseDate: {
        day: media.releaseDate.day,
        month: media.releaseDate.month,
        year: media.releaseDate.year
      },
      visibility: media.visibility,
      status: media.status
    });
    if (media.type === MediaType.TV) {
      this.updateMediaForm.patchValue({
        lastAirDate: {
          day: media.tv.lastAirDate?.day,
          month: media.tv.lastAirDate?.month,
          year: media.tv.lastAirDate?.year
        }
      });
    }
    this.updateMediaInitValue = cloneDeep(this.updateMediaForm.value);
    this.detectFormChange(this.updateMediaForm, this.updateMediaInitValue, this.updateMediaFormChanged);
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

  onUpdateMediaFormSubmit(): void {
    if (!this.media || this.updateMediaForm.invalid) return;
    this.updateMediaForm.disable();
    const mediaId = this.media._id;
    const formValue = this.updateMediaForm.getRawValue();
    const genreIds = formValue.genres?.map(g => g._id) || [];
    const productionIds = formValue.productions?.map(p => p._id) || [];
    const updateMediaDto: UpdateMediaDto = {
      title: formValue.title,
      originalTitle: formValue.originalTitle || null,
      overview: formValue.overview,
      genres: genreIds,
      originalLanguage: formValue.originalLanguage,
      productions: productionIds,
      runtime: formValue.runtime!,
      adult: formValue.adult,
      releaseDate: {
        day: formValue.releaseDate.day!,
        month: formValue.releaseDate.month!,
        year: formValue.releaseDate.year!
      },
      visibility: formValue.visibility,
      status: formValue.status
    };
    if (this.media.type === MediaType.TV && formValue.lastAirDate) {
      updateMediaDto.lastAirDate = {
        day: formValue.lastAirDate.day!,
        month: formValue.lastAirDate.month!,
        year: formValue.lastAirDate.year!
      }
    }
    this.mediaService.update(mediaId, updateMediaDto).pipe(takeUntil(this.destroyService)).subscribe(media => {
      this.media = media;
      this.updateMediaInitValue = cloneDeep(this.updateMediaForm.value);
      this.detectFormChange(this.updateMediaForm, this.updateMediaInitValue, this.updateMediaFormChanged);
      this.ref.markForCheck();
    }).add(() => {
      this.updateMediaForm.enable();
    });
  }

  onUpdateMediaFormReset(): void {
    this.updateMediaForm.reset(this.updateMediaInitValue);
    this.detectFormChange(this.updateMediaForm, this.updateMediaInitValue, this.updateMediaFormChanged);
  }

  onInputPosterChange(file: File): void {
    if (!this.media) return;
    if (file.size > IMAGE_PREVIEW_SIZE)
      throw new Error(AppErrorCode.UPLOAD_POSTER_TOO_LARGE);
    if (!IMAGE_PREVIEW_MIMES.includes(file.type))
      throw new Error(AppErrorCode.UPLOAD_POSTER_UNSUPORTED);
    this.editImage({
      aspectRatioWidth: UPLOAD_POSTER_ASPECT_WIDTH, aspectRatioHeight: UPLOAD_POSTER_ASPECT_HEIGHT,
      minWidth: UPLOAD_POSTER_MIN_WIDTH, minHeight: UPLOAD_POSTER_MIN_HEIGHT,
      imageFile: file, maxSize: UPLOAD_POSTER_SIZE
    }).pipe(switchMap(result => {
      if (!result) return EMPTY;
      const [previewUri, name] = result;
      const posterBlob = dataURItoBlob(previewUri);
      return this.mediaService.uploadPoster(this.media!._id, posterBlob, name);
    })).subscribe(paritalMedia => {
      this.posterFileUpload?.clear();
      this.media = { ...this.media, ...paritalMedia };
      this.hasPoster = true;
      this.ref.markForCheck();
    });
  }

  onInputBackdropChange(file: File): void {
    if (!this.media) return;
    if (file.size > IMAGE_PREVIEW_SIZE)
      throw new Error(AppErrorCode.UPLOAD_BACKDROP_TOO_LARGE);
    if (!IMAGE_PREVIEW_MIMES.includes(file.type))
      throw new Error(AppErrorCode.UPLOAD_BACKDROP_UNSUPORTED);
    this.editImage({
      aspectRatioWidth: UPLOAD_BACKDROP_ASPECT_WIDTH, aspectRatioHeight: UPLOAD_BACKDROP_ASPECT_HEIGHT,
      minWidth: UPLOAD_BACKDROP_MIN_WIDTH, minHeight: UPLOAD_BACKDROP_MIN_HEIGHT,
      imageFile: file, maxSize: UPLOAD_BACKDROP_SIZE
    }).pipe(switchMap(result => {
      if (!result) return EMPTY;
      const [previewUri, name] = result;
      const backdropBlob = dataURItoBlob(previewUri);
      return this.mediaService.uploadBackdrop(this.media!._id, backdropBlob, name);
    })).subscribe(paritalMedia => {
      this.backdropFileUpload?.clear();
      this.media = { ...this.media, ...paritalMedia };
      this.hasBackdrop = true;
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

  /*
  onUpdateImagesFormSubmit(): void {
    if (this.updateImagesForm.invalid || !this.media) return;
    this.isUpdatingImages = true;
    const formValue = this.updateImagesForm.getRawValue();
    const uploadArray = [];
    if (formValue.posterName) {
      const posterBlob = dataURItoBlob(formValue.posterUri!);
      uploadArray.push(this.mediaService.uploadPoster(this.media._id, posterBlob, formValue.posterName).pipe(tap(paritalMedia => {
        if (!this.media) return;
        this.media = { ...this.media, ...paritalMedia }
      })));
    }
    if (formValue.backdropName) {
      const backdropBlob = dataURItoBlob(formValue.backdropUri!);
      uploadArray.push(this.mediaService.uploadBackdrop(this.media._id, backdropBlob, formValue.backdropName).pipe(tap(paritalMedia => {
        if (!this.media) return;
        this.media = { ...this.media, ...paritalMedia }
      })));
    }
    if (!uploadArray.length) {
      this.isUpdatingImages = false;
      return this.stepper?.next();
    }
    forkJoin(uploadArray).subscribe().add(() => {
      this.updateImagesForm.reset();
      this.isUpdatingImages = false;
      this.stepper?.next();
      this.ref.markForCheck();
    });
  }
  */

  showAddVideoDialog(): void {
    if (!this.media) return;
    const dialogRef = this.dialogService.open(AddVideoComponent, {
      data: { ...this.media },
      width: '700px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    dialogRef.onClose.pipe(first()).subscribe((videos: MediaVideo[]) => {
      if (!videos || !this.media) return;
      this.media.videos = videos;
      this.videoCount++;
      this.ref.markForCheck();
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  showAddSubtitleDialog(file?: File): void {
    if (this.media?.type !== MediaType.MOVIE) return;
    if (file && file.size > UPLOAD_SUBTITLE_SIZE)
      throw new Error(AppErrorCode.UPLOAD_SUBTITLE_TOO_LARGE);
    this.subtitleFileUpload?.clear();
    const dialogRef = this.dialogService.open(AddSubtitleComponent, {
      data: { media: { ...this.media }, file: file },
      width: '500px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem' }
    });
    dialogRef.onClose.pipe(first()).subscribe((subtitles: MediaSubtitle[]) => {
      if (!subtitles || !this.media) return;
      this.media.movie.subtitles = subtitles;
      this.subtitleCount++;
      this.ref.markForCheck();
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  showAddEpisodeDialog(): void {
    if (this.media?.type !== MediaType.TV) return;
    const dialogRef = this.dialogService.open(CreateEpisodeComponent, {
      data: { media: { ...this.media }, episodes: [...this.media.tv.episodes] },
      width: '980px',
      modal: true,
      dismissableMask: false,
      styleClass: 'p-dialog-header-sm',
      contentStyle: { 'margin-top': '-1.5rem', 'overflow-y': 'hidden', 'padding': '0px' }
    });
    dialogRef.onClose.pipe(first()).subscribe((episode) => {
      if (!episode || !this.media) return;
      this.media.tv.episodes.push(episode);
      this.episodeCount++;
      this.ref.markForCheck();
    });
    fixNestedDialogFocus(dialogRef, this.dialogRef, this.dialogService, this.renderer, this.document);
  }

  uploadSource(file: File): void {
    if (this.media?.type !== MediaType.MOVIE) return;
    this.queueUploadService.addToQueue(this.media._id, file, `media/${this.media._id}/movie/source`, `media/${this.media._id}/movie/source/:id`);
    this.isUploadingSource = true;
  }

  updateExtStreams(event: ExtStreamSelected): void {
    if (this.media?.type !== MediaType.MOVIE) return;
    this.mediaService.update(this.media._id, { extStreams: event.streams }).subscribe({
      next: () => event.complete()
    });
  }

  closeDialog(): void {
    this.dialogRef.close(this.media);
  }

}
