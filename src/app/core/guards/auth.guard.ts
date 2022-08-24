import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const user = this.authService.currentUser;
    // Not logged in so redirect to login page with the return url
    if (!user) {
      this.router.navigate(['/sign-in'], { queryParams: { continue: state.url } });
      return false;
    }
    // Logged in
    const allowedPerms = <number[]>route.data['withPermissions'];
    if (allowedPerms) {
      return true;
    }
    return true;
  }

}
