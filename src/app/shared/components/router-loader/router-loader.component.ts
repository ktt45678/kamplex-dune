import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

import { RouterLoaderService } from './router-loader.service';

@Component({
  selector: 'app-router-loader',
  templateUrl: './router-loader.component.html',
  styleUrl: './router-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.fixed]': 'fixed',
    '[style.color]': 'color',
  }
})
export class RouterLoaderComponent implements OnInit {
  @Input() fixed = true;
  @Input() color = '#526ED3';
  @Input() value: number | null = null;
  @Input() ref: string | null = null;
  @Input() height: string | null = null;

  get value$() {
    return this.ref ? this.loader.useRef(this.ref).value$ : this.loader.value$;
  }

  constructor(private router: Router, private loader: RouterLoaderService) { }

  ngOnInit(): void {
    const ref = this.loader.useRef('router');
    this.router.events.subscribe((event) => {
      const navState = this.getCurrentNavigationState(this.router);
      if (navState && navState.ignoreLoadingBar) {
        return;
      }

      if (event instanceof NavigationStart) {
        ref.start();
      }

      if (event instanceof NavigationError || event instanceof NavigationEnd || event instanceof NavigationCancel) {
        ref.complete();
      }
    });
  }

  private getCurrentNavigationState(router: any) {
    const currentNavigation = router.getCurrentNavigation();
    if (currentNavigation && currentNavigation.extras) {
      return currentNavigation.extras.state;
    }

    return {};
  }
}
