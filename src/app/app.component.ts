import { ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Event, Router, Scroll } from '@angular/router';
import { filter, pairwise } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(private router: Router, private viewportScroller: ViewportScroller) {
    // Disable automatic scroll restoration to avoid race conditions
    this.viewportScroller.setHistoryScrollRestoration('manual');
    this.handleScrollOnNavigation();
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
        // Check if routes match, or if it is only a query param change
        if (this.getBaseRoute(previous.routerEvent.urlAfterRedirects) !== this.getBaseRoute(current.routerEvent.urlAfterRedirects)) {
          // Routes don't match, this is actual forward navigation
          // Default behavior: scroll to top
          this.viewportScroller.scrollToPosition([0, 0]);
        }
      }
    });
  }

  private getBaseRoute(url: string): string {
    // return url without query params
    return url.split('?')[0];
  }
}
