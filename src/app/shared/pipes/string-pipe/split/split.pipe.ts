import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split'
})
export class SplitPipe implements PipeTransform {

  transform(value: string, key: string, index: number = 0): string {
    const splitValue = value.split(key);
    if (!splitValue.length || index < 0) return '';
    return splitValue[index];
  }

}
