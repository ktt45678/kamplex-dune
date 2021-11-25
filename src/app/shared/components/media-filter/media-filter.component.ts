import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IYearPickerOption } from '../../../core/interfaces/media';
import { MediaFilterService } from './media-filter.service';

@Component({
  selector: 'app-media-filter',
  templateUrl: './media-filter.component.html',
  styleUrls: ['./media-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaFilterComponent implements OnInit {

  countries: any[];
  yearOptions: IYearPickerOption[];
  sortOptions: any[];
  typeOptions: any[];
  selectedCountry?: any;
  filterForm: FormGroup;

  constructor(private mediaFilterService: MediaFilterService) {
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
      { name: 'Australia', code: 'AU' },
      { name: 'Brazil', code: 'BR' },
      { name: 'China', code: 'CN' },
      { name: 'Egypt', code: 'EG' },
      { name: 'France', code: 'FR' },
      { name: 'Germany', code: 'DE' },
      { name: 'India', code: 'IN' },
      { name: 'Japan', code: 'JP' },
      { name: 'Spain', code: 'ES' },
      { name: 'United States of Chapter 2', code: 'US' }
    ];
    this.yearOptions = this.mediaFilterService.createYearList();
    this.typeOptions = [
      { value: 'movie', label: 'Movie' },
      { value: 'tv', label: 'TV Show' }
    ];
    this.sortOptions = [
      { value: 'asc(name)', label: 'Name (Ascending)' },
      { value: 'desc(name)', label: 'Name (Descending)' },
      { value: 'asc(releaseDate)', label: 'Release date (Ascending)' },
      { value: 'desc(releaseDate)', label: 'Release date (Descending)' },
      { value: 'asc(updatedAt)', label: 'Date updated (Ascending)' },
      { value: 'desc(updatedAt)', label: 'Date updated (Descending)' },
      { value: 'asc(views)', label: 'Views (Ascending)' },
      { value: 'desc(views)', label: 'Views (Descending)' },
      { value: 'asc(ratingAverage)', label: 'Score (Ascending)' },
      { value: 'desc(ratingAverage)', label: 'Score (Descending)' },
      { value: 'asc(ratingCount)', label: 'Total ratings (Ascending)' },
      { value: 'desc(ratingCount)', label: 'Total ratings (Descending)' }
    ]
  }

  ngOnInit(): void {
  }

  onFilterFormSubmit(): void {
    this.mediaFilterService.setOptions({
      genres: []
    });
  }

}
