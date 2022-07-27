import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { first, takeUntil } from 'rxjs';

import { CreateMediaDto, DropdownOptionDto } from '../../../../core/dto/media';
import { MediaStatus, MediaType } from '../../../../core/enums';
import { ShortDateForm } from '../../../../core/interfaces/forms';
import { Genre, Production } from '../../../../core/models';
import { DestroyService, GenresService, ItemDataService, MediaService, ProductionsService } from '../../../../core/services';
import { shortDate } from '../../../../core/validators';

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

@Component({
  selector: 'app-create-media',
  templateUrl: './create-media.component.html',
  styleUrls: ['./create-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class CreateMediaComponent implements OnInit {
  MediaType = MediaType;
  isCreatingMedia: boolean = false;
  createMediaForm: FormGroup<CreateMediaForm>;
  days: DropdownOptionDto[] = [];
  months: DropdownOptionDto[] = [];
  years: DropdownOptionDto[] = [];
  languages: DropdownOptionDto[] = [];
  genreSuggestions: Genre[] = [];
  productionSuggestions: Production[] = [];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig, private mediaService: MediaService, private genresService: GenresService,
    private productionsService: ProductionsService, private itemDataService: ItemDataService, private destroyService: DestroyService) {
    const mediaType = this.config.data['type'] || MediaType.MOVIE;
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
    if (mediaType === MediaType.TV) {
      this.createMediaForm.addControl('lastAirDate', new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, { validators: shortDate('day', 'month', 'year', false) }));
      this.createMediaForm.get('status')?.setValue(MediaStatus.AIRED);
    }
  }

  ngOnInit(): void {
    this.days = this.itemDataService.createDateList();
    this.months = this.itemDataService.createMonthList();
    this.years = this.itemDataService.createYearList();
    this.loadGenreSuggestions();
    this.loadProductionSuggestions();
    this.itemDataService.createLanguageList().pipe(first()).subscribe(languages => {
      this.languages = languages
    });
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
    this.isCreatingMedia = true;
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
      next: () => this.dialogRef.close(true),
      error: () => {
        this.isCreatingMedia = false;
        this.ref.markForCheck();
      }
    });
  }

  onCreateMediaFormCancel(): void {
    this.dialogRef.close(false);
  }

}
