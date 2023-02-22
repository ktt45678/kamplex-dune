import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith, tap } from 'rxjs';

@Component({
  selector: 'app-home-layout',
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeLayoutComponent implements OnInit {
  fixedNavbarSpacing: boolean = true;

  constructor(private ref: ChangeDetectorRef, private router: Router) { }

  ngOnInit(): void {
    this.handleNavbarSpacing();
  }

  private handleNavbarSpacing(): void {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(this.router),
      map(() => {
        let route: ActivatedRoute = this.router.routerState.root;
        while (route.firstChild && !route.snapshot.data['applyToChildren'])
          route = route.firstChild;
        return route.snapshot.data;
      }),
      tap(routeData => {
        const fixedNavbarSpacing = routeData['fixedNavbarSpacing'] ?? true;
        if (this.fixedNavbarSpacing !== fixedNavbarSpacing) {
          this.fixedNavbarSpacing = fixedNavbarSpacing;
          this.ref.markForCheck();
        }
      })
    ).subscribe();
  }
}
