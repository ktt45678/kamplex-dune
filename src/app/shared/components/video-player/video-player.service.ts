import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, switchMap } from 'rxjs';

import { M3U8Options, StreamManifest } from '../../../core/interfaces/video-player';
import { convertToM3U8 } from '../../../core/utils';

@Injectable()
export class VideoPlayerService implements OnDestroy {
  private activeSrcUrl?: string;
  private worker?: Worker;

  constructor(private http: HttpClient) {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./video-player.worker', import.meta.url));
    }
  }

  generateM3U8(manifestUrl: string, baseUrl: string, options?: M3U8Options) {
    options = Object.assign({}, { opus: false }, options)
    return this.http.get<StreamManifest>(manifestUrl, {
      headers: { 'x-ng-intercept': 'http-error' }
    }).pipe(switchMap(manifest => {
      return this.manifestToM3U8(manifest, baseUrl, options!);
    }));
  }

  private manifestToM3U8(manifest: StreamManifest, baseUrl: string, options: M3U8Options) {
    return new Observable<string>(observer => {
      if (this.worker) {
        this.worker.onmessage = ({ data }) => {
          this.worker!.onmessage = null;
          observer.next(data);
          observer.complete();
        };
        this.worker.postMessage({ type: 'manifest-to-m3u8', manifest, baseUrl, options });
      } else {
        const result = convertToM3U8(manifest, baseUrl, options);
        observer.next(result);
        observer.complete();
      }
    });
  }

  ngOnDestroy(): void {
    this.worker?.terminate();
  }

  private destroySrcUri() {
    if (this.activeSrcUrl) {
      URL.revokeObjectURL(this.activeSrcUrl);
      this.activeSrcUrl = undefined;
    }
  }
}

/*
if (typeof Worker !== 'undefined') {
  // Create a new
  const worker = new Worker(new URL('./video-player.worker', import.meta.url));
  worker.onmessage = ({ data }) => {
    console.log(`page got message: ${data}`);
  };
  worker.postMessage('hello');
} else {
  // Web Workers are not supported in this environment.
  // You should add a fallback so that your program still executes correctly.
}
*/
