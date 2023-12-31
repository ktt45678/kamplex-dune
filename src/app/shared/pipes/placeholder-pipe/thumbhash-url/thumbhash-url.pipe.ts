import { Pipe, PipeTransform } from '@angular/core';

import { thumbHashToDataURL } from '../../../../core/utils';

@Pipe({
  name: 'thumbhashUrl'
})
export class ThumbhashUrlPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) return '';
    const dataURL = thumbHashToDataURL(Uint8Array.from(window.atob(value), c => c.charCodeAt(0)));
    return dataURL;
  }

}
