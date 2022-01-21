import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { MediaFilterOptionsDto, DropdownOptionDto } from '../../../core/dto/media';

@Injectable()
export class MediaFilterService {
  private options: BehaviorSubject<MediaFilterOptionsDto | undefined>;

  options$: Observable<MediaFilterOptionsDto | undefined>;

  constructor() {
    this.options = new BehaviorSubject<MediaFilterOptionsDto | undefined>(undefined);
    this.options$ = this.options.asObservable();
  }

  setOptions(value: MediaFilterOptionsDto) {
    this.options.next(value);
  }

  createYearList(startYear: number = 1970): DropdownOptionDto[] {
    const currentYear = new Date().getFullYear();
    const years: DropdownOptionDto[] = [];
    while (startYear <= currentYear) {
      years.unshift({
        value: startYear,
        label: startYear.toString()
      });
      startYear++;
    }
    return years;
  }
}
