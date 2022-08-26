import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { formatDuration, intervalToDuration } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

const locales: { [key: string]: Locale } = { en: enUS, vi: vi };

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {
  constructor(private translocoService: TranslocoService) { }

  transform(value: number, format: string[] = ['hours', 'minutes', 'seconds']): string | null {
    if (!value || !isFinite(value))
      return null;
    const roundedValue = Math.floor(value / 1000) * 1000;
    const lang = this.translocoService.getActiveLang();
    const duration = intervalToDuration({ start: 0, end: roundedValue });
    return formatDuration(duration, { format, locale: locales[lang] });
  }

}
