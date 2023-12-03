import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader, TranslocoModule, provideTransloco } from '@ngneat/transloco';
import { Injectable, NgModule } from '@angular/core';
import { provideTranslocoMessageformat } from '@ngneat/transloco-messageformat';
// import { TranslocoPersistTranslationsModule, PERSIST_TRANSLATIONS_STORAGE } from '@ngneat/transloco-persist-translations';
// import * as localForage from 'localforage';

import { environment } from '../environments/environment';

// localForage.config({
//   driver: [localForage.INDEXEDDB, localForage.LOCALSTORAGE],
//   name: 'KamPlexI18N',
//   storeName: 'translations'
// });

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
  exports: [TranslocoModule],
  providers: [
    provideTransloco({
      config: {
        availableLangs: ['en', 'vi'],
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: false,
        prodMode: environment.production,
      },
      loader: TranslocoHttpLoader
    }),
    provideTranslocoMessageformat({
      locales: ['en-US', 'vi-VN']
    })
  ]
})
export class TranslocoRootModule { }
