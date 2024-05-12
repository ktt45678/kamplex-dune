import { Injectable, NgZone } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, retry, throwError, timer } from 'rxjs';
import { MessageService } from 'primeng/api';

import { AuthService } from '../services';
import { ToastKey } from '../enums';
import { CAN_INTERCEPT, RETRY_COUNT } from '../tokens';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private zone: NgZone, private messageService: MessageService, private authService: AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const canIntercept = request.context.get(CAN_INTERCEPT);
    if (!canIntercept.includes('http-error')) {
      return next.handle(request);
    }
    const retryCount = request.context.get(RETRY_COUNT);
    return next.handle(request).pipe(
      retry({
        count: retryCount,
        delay: (error: HttpErrorResponse) => {
          if (error.status && error.status > 500) {
            return timer(3000);
          }
          throw error;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const key = ToastKey.APP;
        const severity = 'error';
        const life = 10000;
        if (error.status) {
          const summary = `${error.status} Error`;
          const detail = error.error.message || 'Request failed';
          switch (error.status) {
            case 401:
              // Check if the authenticated flag exist in the cookie
              const authenticated = document.cookie.indexOf('authenticated=true') > -1;
              if (authenticated) {
                this.authService.signOut().subscribe().add(() => {
                  location.reload();
                });
              }
              this.zone.run(() => this.messageService.add({ key, severity, summary, detail, life }));
              break;
            //case 404:
            //  this.router.navigate(['/']);
            //  this.zone.run(() => this.messageService.add({ key, severity, summary, detail, life }));
            //  break;
            default:
              this.zone.run(() => this.messageService.add({ key, severity, summary, detail, life }));
              break;
          }
        } else if (!navigator.onLine) {
          const summary = 'Network error';
          const detail = 'You are currently offline';
          this.zone.run(() => this.messageService.add({ key, severity, summary, detail, life }));
        } else {
          const summary = 'Unknown network error';
          const detail = error.error.message || 'Request failed';
          this.zone.run(() => this.messageService.add({ key, severity, summary, detail, life }));
        }
        return throwError(() => error);
      }));
  }
}
