import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayIncludes'
})
export class ArrayIncludesPipe implements PipeTransform {

  transform(array: any[] | undefined | null, value: any): boolean {
    if (!array) return false;
    return array.includes(value);
  }

}
