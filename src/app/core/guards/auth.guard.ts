import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services';
import { UserPermission } from '../enums';

@Injectable()
export class AuthGuard {
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
    const allowedPerms = <UserPermission[]>route.data['withPermissions'];
    // No permission required so return true
    if (!allowedPerms?.length) return true;
    // Always return true for the owner
    if (user.owner) return true;
    // Return false for users with no granted permissions
    if (!user.granted) return false;
    // Return true if user has any granted permission
    for (let i = 0; i < user.granted.length; i++) {
      if (allowedPerms.includes(user.granted[i]))
        return true;
    }
    // No matching granted permission
    return false;
  }

}
