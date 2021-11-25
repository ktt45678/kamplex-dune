import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IMediaFilterOptions, IYearPickerOption } from '../../../core/interfaces/media';

@Injectable()
export class MediaFilterService {
  private options: BehaviorSubject<IMediaFilterOptions | undefined>;

  options$: Observable<IMediaFilterOptions | undefined>;

  constructor() {
    this.options = new BehaviorSubject<IMediaFilterOptions | undefined>(undefined);
    this.options$ = this.options.asObservable();
  }

  setOptions(value: IMediaFilterOptions) {
    this.options.next(value);
  }

  createYearList(startYear: number = 1970): IYearPickerOption[] {
    const currentYear = new Date().getFullYear();
    const years: IYearPickerOption[] = [];
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
