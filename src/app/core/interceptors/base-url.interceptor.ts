import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services';
import { CAN_INTERCEPT } from '../tokens';

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {

  constructor(private translocoService: TranslocoService, private authService: AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const canIntercept = request.context.get(CAN_INTERCEPT);
    if (!canIntercept.includes('base-url')) {
      return next.handle(request);
    }
    const canInsertBaseUrl = request.url.indexOf('http://') !== 0 && request.url.indexOf('https://') !== 0 && request.url.indexOf('/assets/i18n/') !== 0;
    const language = this.translocoService.getActiveLang();
    const headers: { [key: string]: string | string[] } = { 'Accept-Language': language };
    this.authService.accessTokenValue && (headers['Authorization'] = this.authService.accessTokenValue);
    this.authService.socketId && (headers['X-Socket-ID'] = this.authService.socketId);
    const apiReq = request.clone({
      url: canInsertBaseUrl ? `${environment.apiUrl}/${request.url}` : request.url,
      setHeaders: headers
    });
    return next.handle(apiReq);
  }
}
