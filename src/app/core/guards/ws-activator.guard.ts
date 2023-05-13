import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { WsService } from '../../shared/modules/ws';
import { AuthService } from '../services';

@Injectable()
export class WsActivatorGuard {
  constructor(private wsService: WsService, private authService: AuthService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.wsService.init();
    this.wsService.fromEventOnce('connect')
      .pipe(tap(() => {
        this.authService.socketId = this.wsService.socket.id;
      })).subscribe();
    return true;
  }

  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.wsService.destroy();
    this.authService.socketId = undefined;
    return true;
  }

}
