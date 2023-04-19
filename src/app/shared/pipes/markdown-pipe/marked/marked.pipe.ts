import { Pipe, PipeTransform } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

import { SanitizeOptions } from '../interfaces';
import { MarkedService } from './marked.service';

@Pipe({
  name: 'marked'
})
export class MarkedPipe implements PipeTransform {
  constructor(private markedService: MarkedService) { }

  transform(value: string, options?: marked.MarkedOptions & SanitizeOptions): string | SafeHtml {
    return this.markedService.parse(value, options);
  }

}
