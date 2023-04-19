import { Pipe, PipeTransform } from '@angular/core';

interface ConversionOptions {
  opacity?: number;
  lightness?: number;
}

@Pipe({
  name: 'hslColor'
})
export class HslColorPipe implements PipeTransform {

  transform(value?: number, options?: ConversionOptions): string {
    options = Object.assign({}, options);
    if (!value) return 'hsl(0, 0, 0)';
    // https://css-tricks.com/converting-color-spaces-in-javascript/
    // Make r, g, and b fractions of 1
    const r = (Math.floor(value / (256 * 256))) / 255;
    const g = (Math.floor(value / 256) % 256) / 255;
    const b = (value % 256) / 255;
    // Find greatest and smallest channel values
    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    let h = 0, s = 0, l = 0;
    // Calculate hue
    // No difference
    if (delta == 0)
      h = 0;
    // Red is max
    else if (cmax == r)
      h = ((g - b) / delta) % 6;
    // Green is max
    else if (cmax == g)
      h = (b - r) / delta + 2;
    // Blue is max
    else
      h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    // Make negative hues positive behind 360°
    if (h < 0)
      h += 360;

    // Calculate lightness
    l = (cmax + cmin) / 2;

    // Calculate saturation
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    // Multiply l and s by 100
    s = +(s * 100).toFixed(1);
    if (!options.lightness)
      l = +(l * 100).toFixed(1);
    else
      l = options.lightness;

    if (options.opacity)
      return `hsla(${h}, ${s}%, ${l}%, ${options.opacity}%)`;
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

}
