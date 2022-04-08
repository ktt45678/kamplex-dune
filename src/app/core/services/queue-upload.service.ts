import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as UpChunk from '@mux/upchunk';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';

import { QueueUploadStatus } from '../enums';
import { UploadSession } from '../models';
import { FileUpload } from '../utils';

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

  public showQueue(): void {
    this._displayQueue.next(true);
  }

  public hideQueue(): void {
    this._displayQueue.next(false);
  }

  private upload(queuedUploadFile: FileUpload) {
    queuedUploadFile.updateProgress(0);
    this._totalBytes += queuedUploadFile.file.size;

    const subscription = this.http.post<UploadSession>(queuedUploadFile.createUrl, {
      filename: queuedUploadFile.file.name,
      mimeType: queuedUploadFile.file.type,
      size: queuedUploadFile.file.size
    }).pipe(switchMap((session: UploadSession) => {
      return new Observable<{ sessionId: string, fileId: string }>(subscriber => {
        let lastUploadedBytes = 0;
        const upload = UpChunk.createUpload({
          endpoint: session.url,
          chunkSize: 10240,
          file: queuedUploadFile.file,
          delayBeforeAttempt: 3
        });
        upload.on('progress', (event) => {
          queuedUploadFile.updateProgress(Math.round(event.detail));
          this._uploadQueue.next(this._files);
          const uploadedBytes = queuedUploadFile.file.size * (event.detail / 100);
          this._uploadedBytes += uploadedBytes - lastUploadedBytes;
          lastUploadedBytes = uploadedBytes;
          const timeElapsed = Date.now() - this._timeStarted;
          const uploadSpeed = this._uploadedBytes / (timeElapsed / 1000);
          this._timeRemaining.next((this._totalBytes - this._uploadedBytes) / uploadSpeed);
          console.log(`total: ${this._totalBytes}, uploaded: ${this._uploadedBytes}, percent: ${event.detail}, time started: ${this._timeStarted}, time elapsed: ${timeElapsed}, upload speed: ${uploadSpeed}, time remaining: ${this._timeRemaining.value}`);
        });
        upload.on('chunkSuccess', (event) => {
          const response = event.detail.response;
          if (response.statusCode === 201 || response.statusCode === 200) {
            this._uploadQueue.next(this._files);
            console.log(typeof response.body);
            const body = JSON.parse(response.body);
            queuedUploadFile.completed();
            this._uploadQueue.next(this._files);
            subscriber.next({ sessionId: session._id, fileId: body.id });
            subscriber.complete();
          }
        });
        upload.on('error', (event) => {
          subscriber.error(event.detail);
          subscriber.complete();
        });
        return () => {
          upload.abort();
          subscriber.complete();
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
