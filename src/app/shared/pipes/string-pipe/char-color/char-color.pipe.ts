import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'charColor'
})
export class CharColorPipe implements PipeTransform {

  transform(value: string): string {
    // Get ASCII code of character
    const charCode = value.charCodeAt(0);

    /**
     * Use a simple algorithm to generate hue value.
     * Multiplies the ASCII code by 15 and then takes the remainder of the result when divided by 360,
     * which ensures that the hue value is always within the range of 0 to 359.
     */
    const hue = charCode * 15 % 360;

    // Convert hue to HSL color string
    const saturation = 80;
    const brightness = 40;
    const bgColor = `hsl(${hue}, ${saturation}%, ${brightness}%)`;

    return bgColor;
  }

}
