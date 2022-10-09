import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslocoService, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { first } from 'rxjs';

import { DropdownOptionDto, MediaFilterOptionsDto } from '../../../core/dto/media';
import { Genre } from '../../../core/models';
import { GenresService } from '../../../core/services';
import { MediaFilterService } from './media-filter.service';

interface FilterForm {
  genres: FormControl<string[]>;
  sort: FormControl<string | null>;
  search: FormControl<string>;
  type: FormControl<string | null>;
  status: FormControl<string | null>;
  originalLanguage: FormControl<string | null>;
  year: FormControl<number | null>;
  showAdvanced: FormControl<boolean>;
}

@Component({
  selector: 'app-media-filter',
  templateUrl: './media-filter.component.html',
  styleUrls: ['./media-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    GenresService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media'
    }
  ]
})
export class MediaFilterComponent implements OnInit {
  @Output() onChange = new EventEmitter<MediaFilterOptionsDto>();

  showAdvanced: boolean = false;
  languages?: DropdownOptionDto[];
  genres?: Genre[];
  yearOptions?: DropdownOptionDto[];
  sortOptions?: DropdownOptionDto[];
  typeOptions?: DropdownOptionDto[];
  statusOptions?: DropdownOptionDto[];
  selectedCountry?: DropdownOptionDto;
  filterForm: FormGroup<FilterForm>;

  constructor(public el: ElementRef, private mediaFilterService: MediaFilterService, private translocoService: TranslocoService,
    private genresService: GenresService) {
    this.filterForm = new FormGroup<FilterForm>({
      genres: new FormControl([], { nonNullable: true }),
      sort: new FormControl(),
      search: new FormControl('', { nonNullable: true, validators: [Validators.minLength(2), Validators.maxLength(100)] }),
      type: new FormControl(),
      status: new FormControl(),
      originalLanguage: new FormControl(),
      year: new FormControl(),
      showAdvanced: new FormControl(this.showAdvanced, { nonNullable: true })
    });
  }

  ngOnInit(): void {
    this.loadGenres();
    this.yearOptions = this.mediaFilterService.createYearList();
    this.mediaFilterService.createLanguageList().pipe(first()).subscribe({
      next: languages => this.languages = languages
    });
    this.translocoService.selectTranslation('media').pipe(first()).subscribe(t => {
      this.typeOptions = [
        { value: 'movie', label: t['mediaTypes.movie'] },
        { value: 'tv', label: t['mediaTypes.tvShow'] }
      ];
      this.sortOptions = [
        { value: 'asc(name)', label: t['sortOptions.nameAscending'] },
        { value: 'desc(name)', label: t['sortOptions.nameDescending'] },
        { value: 'asc(releaseDate)', label: t['sortOptions.releaseDateAscending'] },
        { value: 'desc(releaseDate)', label: t['sortOptions.releaseDateDescending'] },
        { value: 'asc(views)', label: t['sortOptions.viewsAscending'] },
        { value: 'desc(views)', label: t['sortOptions.viewsDescending'] },
        { value: 'asc(ratingAverage)', label: t['sortOptions.scoreAscending'] },
        { value: 'desc(ratingAverage)', label: t['sortOptions.scoreDescending'] },
        { value: 'asc(createdAt)', label: t['sortOptions.dateAddedAscending'] },
        { value: 'desc(createdAt)', label: t['sortOptions.dateAddedDescending'] },
        { value: 'asc(updatedAt)', label: t['sortOptions.dateUpdatedAscending'] },
        { value: 'desc(updatedAt)', label: t['sortOptions.dateUpdatedDescending'] }
      ];
      this.statusOptions = [
        { value: 'upcoming', label: t['statusOptions.upcoming'] },
        { value: 'released', label: t['statusOptions.released'] },
        { value: 'airing', label: t['statusOptions.airing'] },
        { value: 'aired', label: t['statusOptions.aired'] }
      ];
    });
  }

  loadGenres(): void {
    this.genresService.findAll('asc(name)').subscribe({
      next: genres => this.genres = genres
    });
  }

  patchOptions(options: MediaFilterOptionsDto): void {
    this.filterForm.patchValue(options);
  }

  onFilterFormSubmit(): void {
    if (this.filterForm.invalid) return;
    const formValue = this.filterForm.getRawValue();
    if (!formValue.showAdvanced) {
      this.onChange.emit({
        search: formValue.search || undefined,
        genres: formValue.genres,
        sort: formValue.sort
      });
      return;
    }
    this.onChange.emit({
      search: formValue.search,
      genres: formValue.genres,
      sort: formValue.sort,
      type: formValue.type,
      status: formValue.status,
      originalLanguage: formValue.originalLanguage,
      year: formValue.year
    });
  }

}
