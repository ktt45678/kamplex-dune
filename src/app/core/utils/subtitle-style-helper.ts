import { FontFamily, TextEdgeStyle } from '../enums';

export function getFontFamily(fontKey?: string | null): string | null {
  switch (fontKey) {
    case FontFamily.ARIAL_SANS_SERIF:
      return 'Arial, sans-serif';
    case FontFamily.ROBOTO_SANS_SERIF:
      return 'Roboto, sans-serif';
    case FontFamily.HELVETICA_SANS_SERIF:
      return 'Helvetica, sans-serif';
    case FontFamily.VERDANA_SANS_SERIF:
      return 'Verdana, sans-serif';
    case FontFamily.PROPORTIONAL_SANS_SERIF:
      return 'sans-serif';
    case FontFamily.MONOSPACE_SANS_SERIF:
      return '"Andale Mono", "Lucida Console", monospace';
    case FontFamily.PROPORTIONAL_SERIF:
      return 'serif';
    case FontFamily.MONOSPACE_SERIF:
      return '"Courier New", monospace';
    default:
      return null;
  }
}

export function scaleFontSize(source: number, scale?: number | null): string {
  scale = scale || 100;
  return source * (scale / 100) + 'px';
}

export function scaleFontWeight(scale?: number | null): number {
  scale = scale || 4;
  return scale * 100;
}

export function prepareColor(hex?: string | null, opacity?: number | null, defaultValue?: string): string {
  if (!hex) {
    if (defaultValue)
      return defaultValue;
    else
      hex = '#ffffff';
  }
  opacity = opacity != undefined ? opacity : 100;
  const dec = parseInt(hex.substring(1), 16);
  const r = Math.floor(dec / (256 * 256));
  const g = Math.floor(dec / 256) % 256;
  const b = dec % 256;
  const alpha = opacity > 0 ? opacity / 100 : 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getTextEdgeStyle(key?: number | null) {
  switch (key) {
    case TextEdgeStyle.NONE:
      return 'none';
    case TextEdgeStyle.OUTLINE:
    default:
      return '0 0 3px #000, 0 0 3px #000, 0 0 3px #000, 0 0 3px #000';
    case TextEdgeStyle.RAISED:
      return 'rgb(34, 34, 34) 1px 1px, rgb(34, 34, 34) 2px 2px, rgb(34, 34, 34) 3px 3px';
    case TextEdgeStyle.DEPRESSED:
      return 'rgb(204, 204, 204) 1px 1px, rgb(204, 204, 204) 0px 1px, rgb(34, 34, 34) -1px -1px, rgb(34, 34, 34) 0px -1px';
    case TextEdgeStyle.UNIFORM:
      return 'rgb(34, 34, 34) 0px 0px 4px, rgb(34, 34, 34) 0px 0px 4px, rgb(34, 34, 34) 0px 0px 4px, rgb(34, 34, 34) 0px 0px 4px';
    case TextEdgeStyle.DROPSHADOW:
      return 'rgb(34, 34, 34) 2px 2px 3px, rgb(34, 34, 34) 2px 2px 4px, rgb(34, 34, 34) 2px 2px 5px';
  }
}
