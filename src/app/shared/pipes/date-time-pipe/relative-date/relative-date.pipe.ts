import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { formatRelative } from 'date-fns';

import { enUSDateRelative, viDateRelative } from '../../../../core/utils/date-fns-locales';

const locales: { [key: string]: Locale } = { en: enUSDateRelative, vi: viDateRelative };

@Pipe({
  name: 'relativeDate'
})
export class RelativeDatePipe implements PipeTransform {
  constructor(private translocoService: TranslocoService) { }

  transform(value: string, baseDate?: Date): string | null {
    if (!value)
      return null;
    const date = new Date(value);
    const lang = this.translocoService.getActiveLang();
    return formatRelative(date, baseDate || new Date(), { locale: locales[lang] });
  }

}
