import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';

import { environment } from '../../../environments/environment';

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {

  constructor(private translocoService: TranslocoService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.indexOf('http://') === 0 || request.url.indexOf('https://') === 0 || request.url.indexOf('/assets/i18n/') === 0)
      return next.handle(request);
    const language = this.translocoService.getActiveLang();
    const apiReq = request.clone({
      url: `${environment.apiUrl}/${request.url}`,
      setHeaders: { 'Accept-Language': language }
    });
    return next.handle(apiReq);
  }
}
