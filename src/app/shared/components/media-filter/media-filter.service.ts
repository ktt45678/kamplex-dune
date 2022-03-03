import { Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';

import { LANGUAGE_CODES } from '../../../core/data';
import { MediaFilterOptionsDto, DropdownOptionDto } from '../../../core/dto/media';

@Injectable()
export class MediaFilterService {
  private options: Subject<MediaFilterOptionsDto>;

  options$: Observable<MediaFilterOptionsDto>;

  constructor(private translocoService: TranslocoService) {
    this.options = new Subject<MediaFilterOptionsDto>();
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

  createLanguageList(): Observable<DropdownOptionDto[]> {
    return this.translocoService.selectTranslation('languages').pipe(map(t => {
      const languageOptions: DropdownOptionDto[] = [];
      LANGUAGE_CODES.forEach((code) => {
        languageOptions.push({
          label: t[code],
          value: code
        });
      });
      return languageOptions;
    }));
  }
}
