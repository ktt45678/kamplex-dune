import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, catchError, filter, first, fromEvent, map, of, switchMap, throwError } from 'rxjs';
import { gunzip } from 'fflate';
import type { ASS_Style } from 'jassub';

import type { FontInfo } from '../../../core/interfaces/subtitles';
import type { DashConverterOptions, M3U8ConverterOptions, StreamManifest } from '../../../core/interfaces/video-player';
import type { PlayerSettings, PlayerStore, ThumbnailFrame, ThumbnailStore } from './interfaces';
import { streamManifestHelper } from '../../../core/utils';
import { SUBTITLE_FONT_LIST_FILE, SUBTITLE_FONT_LIST_URL } from '../../../../environments/config';

@Injectable()
export class VideoPlayerService implements OnDestroy {
  private activeSrcUrl?: string;
  private worker?: Worker;
  private isWorkerSupported = typeof Worker !== 'undefined';
  private workerMessageId: number = 0;

  constructor(private http: HttpClient) { }

  initPlayerSettings(): PlayerSettings {
    return {
      playbackSpeeds: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      tracks: [],
      sourceBaseUrl: '',
      previewThumbnail: null,
      thumbnailFrames: [],
      activeThumbPlaceholder: null,
      activeQualityValue: 0,
      activeSpeedValue: 1,
      activeTrackValue: null,
      activeAudioLang: null,
      initAudioValue: null,
      initAudioSurround: true,
      autoNext: false,
      showSubtitle: false,
      showFastForward: false,
      showRewind: false,
      fullWindow: false,
      fillScreen: false,
      initPlaytime: 0,
      activeVolume: 1,
      isMuted: false,
      expandVolumeSlider: false,
      isMenuOpen: false,
      hasError: false,
      subtitleStyles: null,
      playerDestroyed: new Subject(),
      storeDisposeFn: [],
      touchControlsTimeoutValue: 2500
    };
  }

  initPlayerStore(): PlayerStore {
    return {
      autoplayError: null,
      audioTracks: [],
      audioTrack: null,
      textTrack: null,
      canFullscreen: false,
      canPlay: false,
      currentTime: 0,
      error: null,
      fullscreen: false,
      loop: false,
      muted: false,
      paused: true,
      playing: false,
      qualities: [],
      quality: null,
      autoQuality: false,
      canSetQuality: true,
      volume: 1,
      waiting: false
    }
  }

  initThumbnailStore(): ThumbnailStore {
    return {
      activeCue: null,
      loading: false
    }
  }

  generateM3U8(manifestUrl: string, baseUrl: string, options?: M3U8ConverterOptions) {
    options = Object.assign({}, { opus: false }, options)
    return this.http.get<StreamManifest>(manifestUrl, {
      headers: { 'x-ng-intercept': 'http-error' }
    }).pipe(switchMap(manifest => {
      return this.manifestToM3U8(manifest, baseUrl, options!);
    }));
  }

  generateParsedDash(manifestUrl: string, baseUrl: string, options?: DashConverterOptions) {
    options = Object.assign({}, { opus: false }, options)
    return this.http.get<StreamManifest>(manifestUrl, {
      headers: { 'x-ng-intercept': 'http-error' }
    }).pipe(map(manifest => {
      return this.manifestToParsedDash(manifest, baseUrl, options!);
    }));
  }

  getPreviewThumbnails(url: string) {
    return this.http.get<ThumbnailFrame[]>(url, { headers: { 'x-ng-intercept': 'ignore' } }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404)
          return of(null);
        return throwError(() => error);
      })
    );
  }

  createThumbnailCues(frames: ThumbnailFrame[]) {
    const cues: VTTCue[] = [];
    frames.forEach(f => {
      cues.push(new VTTCue(f.startTime, f.endTime, `${f.sprite}#xywh=${f.x},${f.y},${f.width},${f.height}`));
    });
    return cues;
  }

  isGzipSubtitle(mimeType: string) {
    return ['application/gzip', 'application/x-gzip'].includes(mimeType);
  }

  loadGzipSubtitle(src: string) {
    return this.http.get(src, { headers: { 'x-ng-intercept': 'ignore' }, responseType: 'arraybuffer' }).pipe(
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

  findSubtitleFontList(styles: ASS_Style[]) {
    return this.http.get<FontInfo[]>(`${SUBTITLE_FONT_LIST_URL}/${SUBTITLE_FONT_LIST_FILE}`,
      { headers: { 'x-ng-intercept': 'ignore' } }
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
