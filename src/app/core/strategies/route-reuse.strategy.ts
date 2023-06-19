import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private lastRoute: string | null = null;
  private lastHandle: DetachedRouteHandle | null = null;
  private returnFrom: string | null = null;

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return !!route.data['shouldReuse'];
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    this.lastRoute = route.routeConfig?.path || null;
    this.lastHandle = handle;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const hasDetached = !!route.routeConfig?.path && route.routeConfig.path === this.lastRoute;
    if (hasDetached) {
      const isValidPrevPath = !route.data['reuseRoutesFrom'] ||
        (this.returnFrom !== null && route.data['reuseRoutesFrom'].indexOf(this.returnFrom) > -1);
      if (isValidPrevPath) {
        return true;
      } else {
        this.lastRoute = null;
        this.lastHandle = null;
      }
    }
    return false;
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.lastHandle;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    this.returnFrom = curr.routeConfig?.path || null;
    return future.routeConfig === curr.routeConfig;
  }
}
