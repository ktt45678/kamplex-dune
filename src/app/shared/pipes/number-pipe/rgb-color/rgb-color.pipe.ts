import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rgbColor'
})
export class RgbColorPipe implements PipeTransform {

  transform(value?: number): string {
    if (!value) return 'rgb (255, 255, 255)';
    const r = Math.floor(value / (256 * 256));
    const g = Math.floor(value / 256) % 256;
    const b = value % 256;
    return `rgb(${r}, ${g}, ${b})`;
  }

}
