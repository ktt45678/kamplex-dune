import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { formatDuration, intervalToDuration } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

import { enUSShort } from '../../../../core/utils/date-fns-locales';

type TimeDisplay = 'long' | 'short' | 'shortColon';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {
  locales: { [key: string]: Locale } = { en: enUS, vi: vi };
  shortLocales: { [key: string]: Locale } = { en: enUSShort };

  constructor(private translocoService: TranslocoService) { }

  transform(value: number, format: string[] = ['hours', 'minutes', 'seconds'], display: TimeDisplay = 'long'): string | null {
    if (!value)
      return null;
    const roundedValue = Math.floor(value / 1000) * 1000;
    const lang = this.translocoService.getActiveLang();
    const duration = intervalToDuration({ start: 0, end: roundedValue });
    if (display === 'shortColon') {
      const zeroPad = (value: number) => String(value).padStart(2, '0');
      return formatDuration(duration, {
        format,
        zero: true,
        delimiter: ':',
        locale: { formatDistance: (_token, count) => zeroPad(count) }
      });
    }
    const locale = display === 'long' ? this.locales[lang] : this.shortLocales['en'];
    return formatDuration(duration, { format, locale });
  }

}
