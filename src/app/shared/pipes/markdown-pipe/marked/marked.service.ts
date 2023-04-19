import { Injectable } from '@angular/core';
import { marked } from 'marked';

import { DompurifyService } from '../../html-pipe';
import { SanitizeOptions } from '../interfaces';

@Injectable()
export class MarkedService {
  constructor(private dompurifyService: DompurifyService) { }

  parse(source: string, options?: marked.MarkedOptions & SanitizeOptions) {
    options = {
      ...options,
      breaks: true,
      domPurifyConfig: {
        //ADD_TAGS: ['iframe'],
        ADD_ATTR: [/*'allow', 'allowfullscreen', 'frameborder', 'scrolling', */'target']
      }
    };
    const renderer = new marked.Renderer();
    const linkRenderer = renderer.link;
    renderer.link = (href, title, text) => {
      const localLink = href?.startsWith(`${location.protocol}//${location.hostname}`);
      const html = linkRenderer.call(renderer, href, title, text);
      return localLink ? html : html.replace(/^<a /, `<a target="_blank" rel="noreferrer noopener nofollow" `);
    };
    const parsed = marked.parse(source, { ...options, renderer });
    if (options.domPurifyConfig) {
      const sanitized = this.dompurifyService.sanitize(parsed, options.domPurifyConfig);
      return sanitized;
    }
    return parsed;
  }
}
