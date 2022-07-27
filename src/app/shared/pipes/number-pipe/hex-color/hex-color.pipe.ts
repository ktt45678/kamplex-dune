import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hexColor'
})
export class HexColorPipe implements PipeTransform {

  transform(value: number): string {
    const hex = value.toString(16);
    return '#' + ('000000' + hex).slice(-6);
  }

}
