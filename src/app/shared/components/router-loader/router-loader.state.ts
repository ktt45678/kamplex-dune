// https://github.com/aitboudad/ngx-loading-bar/blob/main/packages/core/src/loading-bar.state.ts
import { Subject, timer, of, Observable, map, switchMap, take, tap, startWith, shareReplay } from 'rxjs';

import { RouterLoaderConfig } from './router-loader.config';

interface ILoaderState {
  action: 'start' | 'complete' | 'set' | 'stop' | 'increment' | null;
  value: number;
  initialValue: number;
}

export class RouterLoaderState {
  private state: ILoaderState = {
    action: null,
    value: 0,
    initialValue: 0,
  };
  private requests: number | null = null;
  private disabled: boolean = false;
  private readonly stream$ = new Subject<ILoaderState>();
  private _value$: Observable<number> | null = null;

  constructor(private config: RouterLoaderConfig = {}) {
    this.config = {
      latencyThreshold: 0,
      ...config,
    };
  }

  get value$() {
    if (this._value$) {
      return this._value$;
    }

    return (this._value$ = this.stream$.pipe(
      startWith(this.state),
      switchMap((s) => this.timer$(s)),
      shareReplay(),
      map((s) => s.value),
    ));
  }

  start(initialValue = 2) {
    if (this.disabled) {
      return;
    }

    this.next({ action: 'start', initialValue });
  }

  stop() {
    this.next({ action: 'stop' });
  }

  complete() {
    this.next({ action: 'complete' });
  }

  disable() {
    this.disabled = true;
  }

  set(value: number) {
    this.next({ action: 'set', value });
  }

  increment(value = 0) {
    this.next({ action: 'increment', value });
  }

  private next(state: Partial<ILoaderState>, emitEvent = true) {
    switch (state.action) {
      case 'start':
        this.requests = (this.requests || 0) + 1;
        break;
      case 'complete':
        this.requests = (this.requests || 1) - 1;
        if (this.requests > 0) {
          return;
        }
        break;
      case 'stop':
        this.requests = 0;
        break;
      case 'increment':
        state.value = this._increment(state.value);
        break;
    }

    this.state = { ...this.state, action: null, ...state };
    if (emitEvent) {
      this.stream$.next(this.state);
    }
  }

  private timer$ = (s: ILoaderState) => {
    let state$: Observable<Partial<ILoaderState>> = of(s);
    switch (s.action) {
      case 'start':
      case 'increment':
      case 'set': {
        if (s.action === 'start' && this.config.latencyThreshold === 0 && s.value === 0) {
          s.value = s.initialValue;
        }

        if (this.requests !== null && this.requests > 0) {
          state$ = timer(this.config.latencyThreshold || 0, 250).pipe(
            map((t) => ({ ...s, value: t === 0 ? this.state.value || s.initialValue : this._increment() })),
          );
        }
        break;
      }
      case 'complete':
      case 'stop': {
        // Attempt to aggregate any start/complete calls within 500ms:
        state$ =
          s.value === 0
            ? of({ ...s })
            : timer(0, 500).pipe(
              take(2),
              map((t) => ({ value: t === 0 ? 100 : 0 })),
            );
        break;
      }
    }

    return state$.pipe(
      map((next) => <ILoaderState>{ ...next, action: 'set' }),
      tap((next) => this.next(next, false)),
    );
  };

  private _increment(rnd = 0) {
    const stat = this.state.value;
    if (stat >= 99) {
      rnd = 0;
    }

    if (rnd === 0) {
      if (stat >= 0 && stat < 25) {
        // Start out between 3 - 6% increments
        rnd = Math.random() * (5 - 3 + 1) + 3;
      } else if (stat >= 25 && stat < 65) {
        // increment between 0 - 3%
        rnd = Math.random() * 3;
      } else if (stat >= 65 && stat < 90) {
        // increment between 0 - 2%
        rnd = Math.random() * 2;
      } else if (stat >= 90 && stat < 99) {
        // finally, increment it .5 %
        rnd = 0.5;
      } else {
        // after 99%, don't increment:
        rnd = 0;
      }
    }

    return rnd + stat;
  }
}
