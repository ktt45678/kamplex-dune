import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';

import { LANGUAGE_CODES } from '../../../core/data';
import { DropdownOptionDto } from '../../../core/dto/media';

@Injectable()
export class MediaFilterService {

  constructor(private translocoService: TranslocoService) { }

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
