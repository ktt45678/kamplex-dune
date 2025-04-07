import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { format as dateFormat, Locale } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

import { ShortDate } from '../../../../core/models';

const locales: { [key: string]: Locale } = { en: enUS, vi: vi };

@Pipe({
  name: 'shortDate'
})
export class ShortDatePipe implements PipeTransform {
  constructor(private translocoService: TranslocoService) { }

  transform(value: ShortDate, format: string = 'PP'): string | null {
    if (!value)
      return null;
    const date = new Date(value.year, value.month - 1, value.day);
    const lang = this.translocoService.getActiveLang();
    return dateFormat(date, format, { locale: locales[lang] });
  }

}
