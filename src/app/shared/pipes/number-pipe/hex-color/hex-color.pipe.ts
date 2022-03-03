import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hexColor'
})
export class HexColorPipe implements PipeTransform {

  transform(value: number): string {
    return '#' + value.toString(16);
  }

}
