import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { format as dateFormat } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

const locales: { [key: string]: Locale } = { en: enUS, vi: vi };

@Pipe({
  name: 'dateAlt'
})
export class DateAltPipe implements PipeTransform {
  constructor(private translocoService: TranslocoService) { }

  transform(value: string, format: string = 'PP'): string | null {
    if (!value)
      return null;
    const date = new Date(value);
    const lang = this.translocoService.getActiveLang();
    return dateFormat(date, format, { locale: locales[lang] });
  }

}
