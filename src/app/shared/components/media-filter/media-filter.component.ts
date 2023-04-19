import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslocoService, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { first } from 'rxjs';

import { DropdownOptionDto, MediaFilterOptionsDto } from '../../../core/dto/media';
import { Genre, Tag } from '../../../core/models';
import { GenresService, TagsService } from '../../../core/services';
import { MediaFilterService } from './media-filter.service';

interface FilterRecord {
  key: 'genres' | 'tags' | 'search' | 'type' | 'status' | 'originalLanguage' | 'year';
  value: string;
  displayValue: string;
}

interface FilterForm {
  genres: FormControl<Genre[]>;
  tags: FormControl<Tag[]>;
  search: FormControl<string | null>;
  type: FormControl<string | null>;
  status: FormControl<string | null>;
  originalLang: FormControl<string | null>;
  year: FormControl<number | null>;
  showAdvanced: FormControl<boolean>;
}

@Component({
  selector: 'app-media-filter',
  templateUrl: './media-filter.component.html',
  styleUrls: ['./media-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
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
  genreSuggestions: Genre[] = [];
  tagSuggestions: Tag[] = [];
  yearOptions?: DropdownOptionDto[];
  sortOptions?: DropdownOptionDto[];
  typeOptions?: DropdownOptionDto[];
  statusOptions?: DropdownOptionDto[];
  selectedCountry?: DropdownOptionDto;
  filterForm: FormGroup<FilterForm>;

  constructor(private ref: ChangeDetectorRef, public el: ElementRef, private mediaFilterService: MediaFilterService,
    private translocoService: TranslocoService, private genresService: GenresService, private tagsService: TagsService) {
    this.filterForm = new FormGroup<FilterForm>({
      genres: new FormControl([], { nonNullable: true }),
      tags: new FormControl([], { nonNullable: true }),
      search: new FormControl(null, { validators: [Validators.minLength(2), Validators.maxLength(100)] }),
      type: new FormControl(),
      status: new FormControl(),
      originalLang: new FormControl(),
      year: new FormControl(),
      showAdvanced: new FormControl(this.showAdvanced, { nonNullable: true })
    }, { updateOn: 'change' });
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
      this.sortOptions = [];
      this.statusOptions = [
        { value: 'upcoming', label: t['statusOptions.upcoming'] },
        { value: 'released', label: t['statusOptions.released'] },
        { value: 'airing', label: t['statusOptions.airing'] },
        { value: 'aired', label: t['statusOptions.aired'] }
      ];
    });
  }

  loadGenres(): void {
    this.genresService.findAll({ sort: 'asc(name)' }).subscribe({
      next: genres => this.genres = genres
    });
  }

  loadGenreSuggestions(search?: string): void {
    this.genresService.findGenreSuggestions(search, { withCreateOption: false }).subscribe({
      next: genres => this.genreSuggestions = genres
    }).add(() => this.ref.markForCheck());
  }

  loadTagSuggestions(search?: string): void {
    this.tagsService.findTagSuggestions(search, { withCreateOption: false }).subscribe({
      next: tags => this.tagSuggestions = tags
    }).add(() => this.ref.markForCheck());
  }

  patchOptions(options: MediaFilterOptionsDto): void {
    if (options.genres?.length) {
      this.genresService.findAll({ ids: options.genres }).subscribe({
        next: genres => {
          this.filterForm.patchValue({
            genres: genres
          });
        }
      });
    }
    this.filterForm.patchValue({
      search: options.search,
      type: options.type,
      status: options.status,
      originalLang: options.originalLang,
      year: options.year
    });
  }

  onFilterFormSubmit(): void {
    if (this.filterForm.invalid) return;
    const formValue = this.filterForm.getRawValue();
    const genreIds = formValue.genres.map(g => g._id);
    const tagIds = formValue.tags.map(g => g._id);
    this.onChange.emit({
      search: formValue.search || null,
      genres: genreIds,
      tags: tagIds,
      type: formValue.type,
      status: formValue.status,
      originalLang: formValue.originalLang,
      year: formValue.year
    });
  }

}
