// https://github.com/aitboudad/ngx-loading-bar/blob/main/packages/core/src/loading-bar.config.ts
import { InjectionToken } from '@angular/core';

export interface RouterLoaderConfig {
  /**
   * The initial delay time to wait before displaying the loading bar
   * @default 0
   */
  latencyThreshold?: number;
}

export const ROUTER_LOADER_CONFIG = new InjectionToken<RouterLoaderConfig>('ROUTER_LOADER_CONFIG');
