import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'substring'
})
export class SubstringPipe implements PipeTransform {

  transform(value: string, start: number = 0, end: number = 1): string {
    if (!value) return '';
    return value.substring(start, end);
  }

}
