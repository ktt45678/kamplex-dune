import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Observable, catchError, filter, first, forkJoin, fromEvent, map, of, switchMap, throwError } from 'rxjs';
import { gunzip } from 'fflate';
import type { ASS_Style } from 'jassub';
import type { ThumbnailImageInit } from 'vidstack';

import type { FontInfo } from '../../../core/interfaces/subtitles';
import type { DashConverterOptions, M3U8ConverterOptions, StreamManifest } from '../../../core/interfaces/video-player';
import type { ThumbnailFrame } from './interfaces';
import { streamManifestHelper } from '../../../core/utils';
import { SUBTITLE_FONT_LIST_FILE, SUBTITLE_FONT_LIST_URL } from '../../../../environments/config';
import { CAN_INTERCEPT } from '../../../core/tokens';

@Injectable()
export class VideoPlayerService implements OnDestroy {
  private worker?: Worker;
  private isWorkerSupported = typeof Worker !== 'undefined';
  private workerMessageId: number = 0;

  private http = inject(HttpClient);

  constructor() { }

  generateM3U8(manifestUrl: string, baseUrl: string, options?: M3U8ConverterOptions) {
    options = Object.assign({}, { opus: false }, options)
    return this.http.get<StreamManifest>(manifestUrl, {
      context: new HttpContext().set(CAN_INTERCEPT, ['http-error'])
    }).pipe(switchMap(manifest => {
      return this.manifestToM3U8(manifest, baseUrl, options!);
    }));
  }

  generateParsedDash(manifestUrl: string, baseUrl: string, options?: DashConverterOptions) {
    options = Object.assign({}, { opus: false }, options)
    return this.http.get<StreamManifest>(manifestUrl, {
      context: new HttpContext().set(CAN_INTERCEPT, ['http-error'])
    }).pipe(map(manifest => {
      return this.manifestToParsedDash(manifest, baseUrl, options!);
    }));
  }

  generateParsedDashFromUrls(manifestUrls: string[], baseUrl: string, options?: DashConverterOptions) {
    options = Object.assign({}, { opus: false, av1: false }, options)
    return forkJoin(manifestUrls.map(url => this.http.get<StreamManifest>(url, {
      context: new HttpContext().set(CAN_INTERCEPT, ['http-error'])
    }))).pipe(map(manifests => {
      const primaryManifest = manifests.find(m => m.audioTracks.length) || manifests[0];
      const extraManifests = manifests.filter(m => m !== primaryManifest);
      for (let i = 0; i < extraManifests.length; i++) {
        primaryManifest.videoTracks.push(...extraManifests[i].videoTracks);
      }
      return this.manifestToParsedDash(primaryManifest, baseUrl, options!);
    }));
  }

  getPreviewThumbnails(url: string) {
    return this.http.get<ThumbnailFrame[]>(url, { context: new HttpContext().set(CAN_INTERCEPT, []) }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404)
          return of(null);
        return throwError(() => error);
      })
    );
  }

  createThumbnailFrames(frames: ThumbnailFrame[]) {
    const thumbnailFrames: ThumbnailImageInit[] = [];
    frames.forEach(f => {
      thumbnailFrames.push({
        url: f.sprite,
        startTime: f.startTime,
        endTime: f.endTime,
        width: f.width,
        height: f.height,
        coords: {
          x: f.x,
          y: f.y
        }
      });
    });
    return thumbnailFrames;
  }

  isGzipSubtitle(mimeType: string) {
    return ['application/gzip', 'application/x-gzip'].includes(mimeType);
  }

  isBrotliSubtitle(mimeType: string) {
    return ['application/br', 'application/x-br'].includes(mimeType);
  }

  // isZipSubtitle(mimeType: string) {
  //   return ['application/zip', 'application/x-zip-compressed'].includes(mimeType);
  // }

  loadGzipSubtitle(src: string) {
    return this.http.get(src, { context: new HttpContext().set(CAN_INTERCEPT, []), responseType: 'arraybuffer' }).pipe(
      switchMap(subtitleBuffer => {
        return new Observable<string>(observer => {
          gunzip(new Uint8Array(subtitleBuffer), (err, decompressed) => {
            if (err !== null) {
              observer.error(err);
              observer.complete();
              return;
            }
            if (this.isWorkerSupported) {
              this.sendWorkerMessage({ type: 'utf8-decode', source: decompressed }).subscribe(({ data: content }) => {
                observer.next(content);
                observer.complete();
              });
            } else {
              const content = new TextDecoder().decode(decompressed);
              observer.next(content);
              observer.complete();
            }
          });
        });
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404)
          return of(null);
        return throwError(() => error);
      })
    );
  }

  // loadZipSubtitle(src: string) {
  //   return this.http.get(src, { context: new HttpContext().set(CAN_INTERCEPT, []), responseType: 'arraybuffer' }).pipe(
  //     switchMap(subtitleBuffer => {
  //       return new Observable<string>(observer => {
  //         unzip(new Uint8Array(subtitleBuffer), (err, decompressed) => {
  //           if (err !== null) {
  //             observer.error(err);
  //             observer.complete();
  //             return;
  //           }
  //           const targetFileName = Object.keys(decompressed)[0];
  //           const targetFile = decompressed[targetFileName];
  //           if (this.isWorkerSupported) {
  //             this.sendWorkerMessage({ type: 'utf8-decode', source: targetFile }).subscribe(({ data: content }) => {
  //               observer.next(content);
  //               observer.complete();
  //             });
  //           } else {
  //             const content = new TextDecoder().decode(targetFile);
  //             observer.next(content);
  //             observer.complete();
  //           }
  //         });
  //       });
  //     }),
  //     catchError((error: HttpErrorResponse) => {
  //       if (error.status === 404)
  //         return of(null);
  //       return throwError(() => error);
  //     })
  //   );
  // }

  findSubtitleFontList(styles: ASS_Style[]) {
    return this.http.get<FontInfo[]>(`${SUBTITLE_FONT_LIST_URL}/${SUBTITLE_FONT_LIST_FILE}`,
      { context: new HttpContext().set(CAN_INTERCEPT, []) }
    ).pipe(
      map(fontList => {
        const addedFonts: string[] = [];
        const fontUrls: string[] = [];
        for (let i = 0; i < styles.length; i++) {
          const assStyle = styles[i];
          const fontNameLowerCase = assStyle.FontName.toLowerCase();
          if (addedFonts.includes(fontNameLowerCase))
            continue;
          const matchedFonts = fontList.filter(f => f.family.toLowerCase() === fontNameLowerCase);
          if (!matchedFonts.length) continue;
          const matchedFontUrls = matchedFonts.map(f => `${SUBTITLE_FONT_LIST_URL}/${f.path.woff2}`);
          fontUrls.push(...matchedFontUrls);
          addedFonts.push(fontNameLowerCase);
        }
        return fontUrls;
      })
    );
  }

  private manifestToM3U8(manifest: StreamManifest, baseUrl: string, options: M3U8ConverterOptions) {
    return new Observable<string>(observer => {
      if (this.isWorkerSupported) {
        this.sendWorkerMessage({ type: 'manifest-to-m3u8', manifest, baseUrl, options }).subscribe(({ data }) => {
          observer.next(data);
          observer.complete();
        });
      } else {
        const result = streamManifestHelper.convertToM3U8(manifest, baseUrl, options);
        observer.next(result);
        observer.complete();
      }
    });
  }

  private manifestToParsedDash(manifest: StreamManifest, baseUrl: string, options: DashConverterOptions) {
    return streamManifestHelper.convertToParsedDash(manifest, baseUrl, options);
  }

  private sendWorkerMessage(request: any) {
    if (!this.worker)
      this.worker = new Worker(new URL('./video-player.worker', import.meta.url));
    const workerMessageId = ++this.workerMessageId;
    this.worker.postMessage({ id: workerMessageId, request });
    return fromEvent<MessageEvent<any>>(this.worker, 'message').pipe(
      filter(event => event.data.id === workerMessageId),
      first(),
      map(event => ({ event, data: event.data.response }))
    );
  }

  ngOnDestroy(): void {
    this.worker?.terminate();
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
