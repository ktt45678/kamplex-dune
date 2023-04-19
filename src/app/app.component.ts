import { ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Event, NavigationEnd, Router, Scroll } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { EMPTY, filter, first, map, pairwise, switchMap } from 'rxjs';

import { SITE_NAME } from '../environments/config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private title: Title, private viewportScroller: ViewportScroller,
    private translocoService: TranslocoService) { }

  ngOnInit(): void {
    // Disable automatic scroll restoration to avoid race conditions
    this.viewportScroller.setHistoryScrollRestoration('manual');
    this.handleScrollOnNavigation();
    this.handlePageTitle();
  }

  private handleScrollOnNavigation(): void {
    this.router.events.pipe(
      filter((e: Event): e is Scroll => e instanceof Scroll),
      pairwise()
    ).subscribe((e: Scroll[]) => {
      const previous = e[0];
      const current = e[1];
      if (current.position) {
        // Backward navigation
        this.viewportScroller.scrollToPosition(current.position);
      } else if (current.anchor) {
        // Anchor navigation
        this.viewportScroller.scrollToAnchor(current.anchor);
      } else {
        let route: ActivatedRoute = this.router.routerState.root;
        while (route.firstChild && !route.snapshot.data['applyToChildren'])
          route = route.firstChild;
        if (route.snapshot.data['keepScrollPosition'] === true)
          return;
        // Check if routes match, or if it is only a query param change
        if (this.getBaseRoute(previous.routerEvent.urlAfterRedirects) !== this.getBaseRoute(current.routerEvent.urlAfterRedirects)) {
          // Routes don't match, this is actual forward navigation
          // Default behavior: scroll to top
          this.viewportScroller.scrollToPosition([0, 0]);
        }
      }
    });
  }

  private handlePageTitle(): void {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => {
        let route: ActivatedRoute = this.router.routerState.root;
        while (route.firstChild && !route.snapshot.data['applyToChildren'])
          route = route.firstChild;
        return route.snapshot.data;
      }),
      switchMap(routeData => {
        if (routeData['disableTitleStrategy'])
          return EMPTY;
        const title = routeData['title'];
        if (!title) {
          this.title.setTitle(SITE_NAME);
          return EMPTY;
        }
        return this.translocoService.selectTranslate(`pageTitles.${title}`).pipe(first());
      })
    ).subscribe(title => {
      this.title.setTitle(`${title} - ${SITE_NAME}`);
    });
  }

  private getBaseRoute(url: string): string {
    // return url without query params
    return url.split('?')[0];
  }
}
