import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.indexOf('http://') === 0 || request.url.indexOf('https://') === 0 || request.url.indexOf('/assets/i18n/') === 0)
      return next.handle(request);
    const apiReq = request.clone({ url: `${environment.apiUrl}/${request.url}` });
    return next.handle(apiReq);
  }
}
