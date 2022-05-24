import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Duration } from 'luxon';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {
  constructor(private translocoService: TranslocoService) { }

  transform(value: number, format?: string): string | null {
    if (!value)
      return null;
    const roundedValue = Math.floor(value / 1000) * 1000;
    const lang = this.translocoService.getActiveLang();
    const time = Duration.fromMillis(roundedValue, { locale: lang });
    if (format)
      return time.toFormat(format);
    return time.shiftTo('minutes', 'seconds').toHuman();
  }

}
