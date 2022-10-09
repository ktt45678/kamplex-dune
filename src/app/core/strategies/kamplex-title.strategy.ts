import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, RouterStateSnapshot } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { first } from 'rxjs';

import { SITE_NAME } from '../../../environments/config';

@Injectable()
export class KamPlexTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title, private translocoService: TranslocoService) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      this.translocoService.selectTranslate(`pageTitles.${title}`).pipe(first()).subscribe(translatedTitle => {
        this.title.setTitle(`${translatedTitle} | ${SITE_NAME}`);
      });
    } else {
      this.title.setTitle(SITE_NAME);
    }
  }
}
