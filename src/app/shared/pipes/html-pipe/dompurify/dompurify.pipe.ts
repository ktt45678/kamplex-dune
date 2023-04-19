import { Pipe, PipeTransform } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

import { DompurifyService } from './dompurify.service';

@Pipe({
  name: 'dompurify'
})
export class DompurifyPipe implements PipeTransform {
  constructor(private dompurifyService: DompurifyService) { }

  transform(value: string): SafeHtml {
    return this.dompurifyService.sanitize(value);
  }

}
