import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HttpCacheInterceptorModule } from '@ngneat/cashew';
import { RecaptchaSettings, RECAPTCHA_SETTINGS } from 'ng-recaptcha';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { cloneDeep } from 'lodash-es';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeLayoutModule } from './shared/layouts/home-layout';
import { environment } from '../environments/environment';
import { TranslocoRootModule } from './transloco-root.module';
import { BaseUrlInterceptor } from './core/interceptors/base-url.interceptor';
import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { GlobalErrorHandler } from './core/handlers/global-error-handler';
import { AppInitializer } from './core/initializers/app.initializer';
import { AuthService } from './core/services';
import { HTTP_CACHE_TTL } from '../environments/config';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    HttpClientModule,
    HttpCacheInterceptorModule.forRoot({
      ttl: HTTP_CACHE_TTL,
      responseSerializer(body) {
        return cloneDeep(body);
      }
    }),
    TranslocoRootModule,
    HomeLayoutModule,
    ToastModule
  ],
  providers: [
    MessageService,
    {
      provide: APP_INITIALIZER,
      useFactory: AppInitializer,
      multi: true,
      deps: [AuthService]
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BaseUrlInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: { siteKey: environment.recaptchaSiteKey } as RecaptchaSettings
    },
    {
      provide: OverlayContainer,
      useClass: FullscreenOverlayContainer,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
