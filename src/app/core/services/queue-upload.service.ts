import { HttpClient, HttpEventType, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, Observable, retry, switchMap, tap } from 'rxjs';

import { QueueUploadStatus } from '../enums';
import { UploadSession } from '../models';
import { FileUpload } from '../utils';
import { QUEUE_UPLOAD_CHUNK_SIZE, QUEUE_UPLOAD_RETRIES, QUEUE_UPLOAD_RETRY_DELAY } from '../../../environments/config';

@Injectable()
export class QueueUploadService {
  private _files: FileUpload[] = [];
  private _uploadedBytes = 0;
  private _totalBytes = 0;
  private _timeStarted = 0;
  private _uploadQueue: BehaviorSubject<FileUpload[]>;
  public uploadQueue: Observable<FileUpload[]>;
  private _displayQueue: BehaviorSubject<boolean>;
  public displayQueue: Observable<boolean>;
  private _timeRemaining: BehaviorSubject<number>;
  public timeRemaining: Observable<number>;

  constructor(private http: HttpClient) {
    this._uploadQueue = new BehaviorSubject<FileUpload[]>([]);
    this.uploadQueue = this._uploadQueue.asObservable();
    this._displayQueue = new BehaviorSubject<boolean>(false);
    this.displayQueue = this._displayQueue.asObservable();
    this._timeRemaining = new BehaviorSubject<number>(0);
    this.timeRemaining = this._timeRemaining.asObservable();
  }

  public addToQueue(id: string, file: File, createUrl: string, completeUrl: string): void {
    const queuedUploadFile = new FileUpload(id, file, createUrl, completeUrl);
    const totalFiles = this._files.push(queuedUploadFile);
    this._uploadQueue.next(this._files);
    if (this._files.filter(u => u.status === QueueUploadStatus.UPLOADING).length === 0) {
      this._timeStarted = Date.now();
    }
    this.upload(this._files[totalFiles - 1]);
    this.showQueue();
  }

  public removeFromQueue(queuedUploadFile: FileUpload) {
    for (let i = 0; i < this._files.length; i++) {
      if (this._files[i].id === queuedUploadFile.id) {
        this._files.splice(i, 1);
        this._uploadQueue.next(this._files);
        break;
      }
    }
  }

  public showQueue(): void {
    this._displayQueue.next(true);
  }

  public hideQueue(): void {
    this._displayQueue.next(false);
  }

  public isMediaInQueue(id: string): boolean {
    const index = this._files.findIndex(f => f.id === id);
    return index > -1;
  }

  private upload(queuedUploadFile: FileUpload) {
    queuedUploadFile.updateProgress(0);
    this._totalBytes += queuedUploadFile.file.size;

    const subscription = this.http.post<UploadSession>(queuedUploadFile.createUrl, {
      filename: queuedUploadFile.file.name,
      mimeType: queuedUploadFile.file.type,
      size: queuedUploadFile.file.size
    }).pipe(switchMap((session: UploadSession) => {
      /*
      return new Observable<{ sessionId: string, fileId: string }>(observer => {
        let lastUploadedBytes = 0;
        const upload = UpChunk.createUpload({
          endpoint: session.url,
          chunkSize: 10240,
          file: queuedUploadFile.file,
          delayBeforeAttempt: 3
        });
        upload.on('progress', (event) => {
          if (queuedUploadFile.status !== QueueUploadStatus.UPLOADING) return;
          queuedUploadFile.updateProgress(Math.round(event.detail));
          this._uploadQueue.next(this._files);
          const uploadedBytes = queuedUploadFile.file.size * (event.detail / 100);
          this._uploadedBytes += uploadedBytes - lastUploadedBytes;
          lastUploadedBytes = uploadedBytes;
          const timeElapsed = Date.now() - this._timeStarted;
          const uploadSpeed = this._uploadedBytes / timeElapsed;
          this._timeRemaining.next((this._totalBytes - this._uploadedBytes) / uploadSpeed);
          //console.log(`total: ${this._totalBytes}, uploaded: ${this._uploadedBytes}, percent: ${event.detail}, time started: ${this._timeStarted}, time elapsed: ${timeElapsed}, upload speed: ${uploadSpeed}, time remaining: ${this._timeRemaining.value}`);
        });
        upload.on('chunkSuccess', (event) => {
          const response = event.detail.response;
          if (response.statusCode === 201 || response.statusCode === 200) {
            const body = JSON.parse(response.body);
            queuedUploadFile.completed();
            this._uploadQueue.next(this._files);
            observer.next({ sessionId: session._id, fileId: body.id });
            observer.complete();
          }
        });
        upload.on('error', (event) => {
          observer.error(event.detail);
          observer.complete();
        });
        return () => {
          if (queuedUploadFile.status !== QueueUploadStatus.UPLOADING) return;
          queuedUploadFile.cancel();
          this._uploadQueue.next(this._files);
          upload.abort();
          observer.complete();
        };
      });
      */
      return new Observable<{ sessionId: string, fileId: string }>(observer2 => {
        let allChunkUploadedBytes = 0;
        let lastUploadedBytes = 0;
        const chunkUploadSub = new Observable<{ startOffset: number, endOffset: number, fileSize: number, chunk: Blob }>(observer => {
          for (let startOffset = 0; startOffset < queuedUploadFile.file.size; startOffset += QUEUE_UPLOAD_CHUNK_SIZE) {
            const endOffset = Math.min(startOffset + QUEUE_UPLOAD_CHUNK_SIZE, queuedUploadFile.file.size);
            const chunk = queuedUploadFile.file.slice(startOffset, endOffset);
            observer.next({ startOffset, endOffset: endOffset - 1, chunk, fileSize: queuedUploadFile.file.size });
          }
          observer.complete();
        }).pipe(concatMap(({ startOffset, endOffset, fileSize, chunk }) => {
          return this.http.put<{ id: string }>(session.url, chunk, {
            headers: {
              'Content-Range': `bytes ${startOffset}-${endOffset}/${fileSize}`,
              'x-ng-intercept': 'ignore',
              'ngsw-bypass': 'true'
            },
            reportProgress: true,
            responseType: 'json',
            observe: 'events'
          }).pipe(
            retry({ count: QUEUE_UPLOAD_RETRIES, delay: QUEUE_UPLOAD_RETRY_DELAY }),
            tap(res => {
              if (res.type === HttpEventType.UploadProgress) {
                // Chunk upload progress
                const fileUploadedBytes = allChunkUploadedBytes + res.loaded;
                const percent = (fileUploadedBytes / queuedUploadFile.file.size) * 100;
                queuedUploadFile.updateProgress(percent);
                this._uploadQueue.next(this._files);
                // Total uploaded bytes in queue
                this._uploadedBytes += allChunkUploadedBytes - lastUploadedBytes;
                lastUploadedBytes = allChunkUploadedBytes;
                // Estimate upload speed
                const timeElapsed = Date.now() - this._timeStarted;
                const uploadSpeed = this._uploadedBytes / timeElapsed;
                // Make sure not to divide by zero
                if (uploadSpeed > 0)
                  this._timeRemaining.next((this._totalBytes - this._uploadedBytes) / uploadSpeed);
              } else if (res.type === HttpEventType.Response) {
                // Chunk success
                allChunkUploadedBytes += chunk.size;
                if (res.status === HttpStatusCode.Created && res.body) {
                  queuedUploadFile.updateProgress(100);
                  queuedUploadFile.completed();
                  this._uploadQueue.next(this._files);
                  observer2.next({ sessionId: session._id, fileId: res.body.id });
                  observer2.complete();
                }
              }
            }));
        })).subscribe();
        return () => {
          if (queuedUploadFile.status !== QueueUploadStatus.UPLOADING) return;
          chunkUploadSub.unsubscribe();
          queuedUploadFile.cancel();
          this._uploadQueue.next(this._files);
          observer2.complete();
        }
      });
    }), switchMap(data => {
      const completeUrl = queuedUploadFile.completeUrl.replace(':id', data.sessionId);
      return this.http.post(completeUrl, {
        fileId: data.fileId
      });
    })).subscribe({
      error: () => {
        queuedUploadFile.failed();
        this._uploadQueue.next(this._files);
      }
    });

    queuedUploadFile.subscription = subscription;
  }
}
