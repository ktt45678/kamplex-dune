import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader, TRANSLOCO_CONFIG, translocoConfig, TranslocoModule } from '@ngneat/transloco';
import { Injectable, NgModule } from '@angular/core';
import { TranslocoMessageFormatModule } from '@ngneat/transloco-messageformat';
import { TranslocoPersistTranslationsModule, PERSIST_TRANSLATIONS_STORAGE } from '@ngneat/transloco-persist-translations';
import * as localForage from 'localforage';

import { environment } from '../environments/environment';

localForage.config({
  driver: localForage.INDEXEDDB,
  name: 'KamPlexI18N',
  storeName: 'translations'
});

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) { }

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`, {
      headers: {
        'x-ng-intercept': 'ignore'
      }
    });
  }
}

@NgModule({
  imports: [
    TranslocoMessageFormatModule.forRoot(),
    TranslocoPersistTranslationsModule.forRoot({
      loader: TranslocoHttpLoader,
      ttl: environment.production ? 3600 : 30,
      storage: {
        provide: PERSIST_TRANSLATIONS_STORAGE,
        useValue: localForage
      }
    })
  ],
  exports: [TranslocoModule],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ['en', 'vi'],
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: false,
        prodMode: environment.production,
      })
    }
  ]
})
export class TranslocoRootModule { }
