import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslocoService, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { takeUntil } from 'rxjs';

import { DropdownOptionDto } from '../../../core/dto/media';
import { DestroyService } from '../../../core/services/destroy.service';
import { MediaFilterService } from './media-filter.service';

@Component({
  selector: 'app-media-filter',
  templateUrl: './media-filter.component.html',
  styleUrls: ['./media-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DestroyService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media'
    }
  ]
})
export class MediaFilterComponent implements OnInit {

  countries: any[];
  yearOptions: DropdownOptionDto[];
  sortOptions?: DropdownOptionDto[];
  typeOptions?: DropdownOptionDto[];
  statusOptions?: DropdownOptionDto[];
  selectedCountry?: DropdownOptionDto;
  filterForm: FormGroup;

  constructor(private mediaFilterService: MediaFilterService, private translocoService: TranslocoService, private destroyService: DestroyService) {
    this.filterForm = new FormGroup({
      genres: new FormControl([]),
      sort: new FormControl(),
      search: new FormControl(null, [Validators.minLength(3), Validators.maxLength(100)]),
      type: new FormControl(),
      status: new FormControl(),
      country: new FormControl(),
      year: new FormControl()
    });
    this.countries = [
      { label: 'Australia', value: 'AU' },
      { label: 'Brazil', value: 'BR' },
      { label: 'China', value: 'CN' },
      { label: 'Egypt', value: 'EG' },
      { label: 'France', value: 'FR' },
      { label: 'Germany', value: 'DE' },
      { label: 'India', value: 'IN' },
      { label: 'Japan', value: 'JP' },
      { label: 'Spain', value: 'ES' },
      { label: 'United States of Chapter 2', value: 'US' }
    ];
    this.yearOptions = this.mediaFilterService.createYearList();
  }

  ngOnInit(): void {
    this.translocoService.selectTranslation('media').pipe(takeUntil(this.destroyService)).subscribe(t => {
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
        { value: 'asc(ratingCount)', label: t['sortOptions.totalRatingsAscending'] },
        { value: 'desc(ratingCount)', label: t['sortOptions.totalRatingsDescending'] },
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

  onFilterFormSubmit(): void {
    this.mediaFilterService.setOptions({
      genres: []
    });
  }

}
