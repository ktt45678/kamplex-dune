import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toString'
})
export class ToStringPipe implements PipeTransform {

  transform(value: number, radix?: number): string {
    return value.toString(radix);
  }

}
