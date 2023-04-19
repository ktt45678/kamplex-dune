import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { sanitize, Config } from 'dompurify';

@Injectable()
export class DompurifyService {
  constructor(private sanitizer: DomSanitizer) { }

  sanitize(source: string, config?: Config) {
    return this.sanitizer.bypassSecurityTrustHtml(sanitize(source, {
      ...config,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false
    }));
  }
}
