// https://github.com/aitboudad/ngx-loading-bar/blob/main/packages/core/src/loading-bar.service.ts
import { Inject, Injectable, NgZone, Optional, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, OperatorFunction, Subject, combineLatest, map, startWith, switchMap } from 'rxjs';

import { RouterLoaderState } from './router-loader.state';
import { ROUTER_LOADER_CONFIG, RouterLoaderConfig } from './router-loader.config';

@Injectable()
export class RouterLoaderService {
  private readonly refs: { [id: string]: RouterLoaderState } = {};
  private readonly streams$ = new Subject<void>();
  readonly value$ = this.streams$.pipe(
    startWith(null),
    switchMap(() => combineLatest(Object.keys(this.refs).map((s) => this.refs[s].value$))),
    runInZone(this.zone),
    map((v) => Math.max(0, ...v)),
  );

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(ROUTER_LOADER_CONFIG) private config: RouterLoaderConfig = {},
    @Optional() private zone?: NgZone) { }

  useRef(id: string = 'default'): RouterLoaderState {
    if (!this.refs[id]) {
      this.refs[id] = new RouterLoaderState(this.config);
      this.streams$.next();

      if (!isPlatformBrowser(this.platformId)) {
        this.refs[id].disable();
      }
    }

    return this.refs[id];
  }
}

// https://stackoverflow.com/a/57452361/1406096
export function runInZone<T>(zone?: NgZone): OperatorFunction<T, T> {
  if (!zone) {
    return (source) => source;
  }

  return (source) =>
    new Observable((observer) =>
      source.subscribe({
        next: (value: T) => zone.run(() => observer.next(value)),
        error: (e: any) => zone.run(() => observer.error(e)),
        complete: () => zone.run(() => observer.complete())
      }),
    );
}
