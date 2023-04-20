import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { formatDuration, intervalToDuration } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

import { enUSShort } from '../../../../core/utils/date-fns-locales';

type TimeDisplay = 'long' | 'short' | 'shortColon';

interface TimeOptions {
  format?: string[];
  display?: TimeDisplay;
  zero?: boolean;
  zeroPad?: boolean;
  fallbackToSeconds?: boolean;
}

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {
  locales: { [key: string]: Locale } = { en: enUS, vi: vi };
  shortLocales: { [key: string]: Locale } = { en: enUSShort };

  constructor(private translocoService: TranslocoService) { }

  transform(value: number, options?: TimeOptions): string | null {
    options = Object.assign({}, {
      format: ['hours', 'minutes', 'seconds'], display: 'long', zero: false, zeroPad: true, fallbackToSeconds: true
    }, options);
    if (value == undefined)
      return null;
    const { format, display, zero, zeroPad, fallbackToSeconds } = options;
    if (fallbackToSeconds && value < 60000 && !format!.includes('seconds'))
      format!.push('seconds');
    const roundedValue = Math.floor(value / 1000) * 1000;
    const lang = this.translocoService.getActiveLang();
    const duration = intervalToDuration({ start: 0, end: roundedValue });
    if (display === 'shortColon') {
      const convertToString = (value: number) => {
        const result = String(value);
        if (zeroPad) return result.padStart(2, '0');
        return result;
      };
      return formatDuration(duration, {
        format,
        zero: zero,
        delimiter: ':',
        locale: { formatDistance: (_token, count) => convertToString(count) }
      });
    }
    const locale = display === 'long' ? this.locales[lang] : this.shortLocales['en'];
    return formatDuration(duration, { format, locale });
  }

}
