import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { map, Observable } from 'rxjs';

import { COUNTRY_CODES, LANGUAGE_CODES, TRANSLATE_CODES } from '../data';
import { DropdownOptionDto } from '../dto/media';

@Injectable()
export class ItemDataService {

  constructor(private translocoService: TranslocoService) { }

  createDateList(maxDate: number = 31): DropdownOptionDto[] {
    const dates: DropdownOptionDto[] = [];
    for (let i = 1; i <= maxDate; i++) {
      dates.push({
        label: i,
        value: i
      });
    }
    return dates;
  }

  createMonthList(maxMonth: number = 12): DropdownOptionDto[] {
    const months: DropdownOptionDto[] = [];
    const lang = this.translocoService.getActiveLang();
    for (let i = 1; i <= maxMonth; i++) {
      const sample = new Date();
      sample.setMonth(i - 1, 1);
      months.push({
        label: sample.toLocaleString(lang, { month: 'long' }),
        value: i
      });
    }
    return months;
  }

  createYearList(minYear: number = 1870): DropdownOptionDto[] {
    const currentYear = new Date().getFullYear();
    const years: DropdownOptionDto[] = [];
    for (let i = currentYear; i >= minYear; i--) {
      years.push({
        label: i,
        value: i
      });
    }
    return years;
  }

  createCountryList(): Observable<DropdownOptionDto[]> {
    return this.translocoService.selectTranslation('countries').pipe(map(t => {
      const countryOptions: DropdownOptionDto[] = [];
      COUNTRY_CODES.forEach(code => {
        countryOptions.push({
          label: t[code],
          value: code
        });
      });
      return countryOptions;
    }));
  }

  createLanguageList(disabledValues?: string[]): Observable<DropdownOptionDto[]> {
    return this.translocoService.selectTranslation('languages').pipe(map(t => {
      const languageOptions: DropdownOptionDto[] = [];
      if (!disabledValues) {
        LANGUAGE_CODES.forEach((code) => {
          languageOptions.push({
            label: t[code],
            value: code
          });
        });
      } else {
        LANGUAGE_CODES.forEach((code) => {
          const option: DropdownOptionDto = {
            label: t[code],
            value: code
          };
          const valueIndex = disabledValues.indexOf(code);
          if (valueIndex > -1) {
            option.disabled = true;
            disabledValues.splice(valueIndex, 1);
          } else {
            option.disabled = false;
          }
          languageOptions.push(option);
        });
      }
      return languageOptions;
    }));
  }

  createTranslateOptions(): Observable<DropdownOptionDto[]> {
    return this.translocoService.selectTranslation('languages').pipe(map(t => {
      const translateOptions: DropdownOptionDto[] = [];
      TRANSLATE_CODES.forEach(code => {
        translateOptions.push({
          label: t[code],
          value: code
        });
      });
      return translateOptions;
    }));
  }
}
