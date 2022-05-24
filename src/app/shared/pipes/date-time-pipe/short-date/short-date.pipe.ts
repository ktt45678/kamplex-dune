import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { DateTime } from 'luxon';

import { ShortDate } from '../../../../core/models';

@Pipe({
  name: 'shortDate'
})
export class ShortDatePipe implements PipeTransform {
  constructor(private translocoService: TranslocoService) { }

  transform(value: ShortDate, format?: string): string | null {
    if (!value)
      return null;
    const date = DateTime.fromObject({ year: value.year, month: value.month, day: value.day });
    const lang = this.translocoService.getActiveLang();
    if (format)
      return date.toFormat(format, { locale: lang });
    return date.toLocaleString(DateTime.DATE_FULL, { locale: lang });
  }

}
