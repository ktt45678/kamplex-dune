import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as UpChunk from '@mux/upchunk';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';

import { UploadSession } from '../models';
import { FileUpload } from '../models/file-upload.model';

@Injectable()
export class QueueUploadService {
  private _files: FileUpload[] = [];
  private _uploadQueue: BehaviorSubject<FileUpload[]>;
  public uploadQueue: Observable<FileUpload[]>;

  constructor(private http: HttpClient) {
    this._uploadQueue = new BehaviorSubject<FileUpload[]>([]);
    this.uploadQueue = this._uploadQueue.asObservable();
  }

  public addToQueue(file: File, createUrl: string, completeUrl: string) {
    const queuedUploadFile = new FileUpload(file, createUrl, completeUrl);
    const totalFiles = this._files.push(queuedUploadFile);
    this._uploadQueue.next(this._files);
    this.upload(this._files[totalFiles - 1]);
  }

  private upload(queuedUploadFile: FileUpload) {
    queuedUploadFile.updateProgress(0);

    return this.http.post<UploadSession>(queuedUploadFile.createUrl, {
      filename: queuedUploadFile.file.name,
      mimeType: queuedUploadFile.file.type,
      size: queuedUploadFile.file.size
    }).pipe(switchMap((session: UploadSession) => {
      /*
      const totalSize = queuedUploadFile.file.size;
      const chunkSize = 31457280;
      let startChunk = 0;
      const chunk = queuedUploadFile.file.slice(startChunk, startChunk + chunkSize);
      let endChunk = startChunk + chunk.size - 1;
      return this.http.put(session.url, chunk, {
        headers: {
          'Content-Range': `bytes ${startChunk}-${endChunk}/${totalSize}`
        },
        reportProgress: true,
        observe: 'events'
      }).pipe(tap((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * event.loaded / (event.total || 0));
          queuedUploadFile.updateProgress(percentDone);
        }
      }), expand(() => {
        if (startChunk + chunkSize < totalSize) {
          startChunk += chunkSize;
          const chunk = queuedUploadFile.file.slice(startChunk, startChunk + chunkSize);
          let endChunk = startChunk + chunk.size - 1;
          return this.http.put(session.url, chunk, {
            headers: {
              'Content-Range': `bytes ${startChunk}-${endChunk}/${totalSize}`
            },
            reportProgress: true,
            observe: 'events'
          });
        }
        return EMPTY;
      }), map((event) => {
        queuedUploadFile.completed();
        if (event.type === HttpEventType.Response) {
          return event.body;
        }
        return null;
      }), zipWith(of(session)));
      */
      const upload = UpChunk.createUpload({
        endpoint: session.url,
        chunkSize: 30720,
        file: queuedUploadFile.file
      });
      upload.on('progress', (event) => {
        queuedUploadFile.updateProgress(Math.round(event.detail));
        this._uploadQueue.next(this._files);
      });
      return new Observable<{ sessionId: string, fileId: string }>(subscriber => {
        upload.on('chunkSuccess', (event) => {
          const response = event.detail.response;
          if (response.statusCode === 201 || response.statusCode === 200) {
            queuedUploadFile.completed();
            this._uploadQueue.next(this._files);
            const body = JSON.parse(response.body);
            subscriber.next({ sessionId: session._id, fileId: body.id });
          }
        });
      });
    }), switchMap(data => {
      console.log(data);
      const completeUrl = queuedUploadFile.completeUrl.replace(':id', data.sessionId);
      return this.http.post<UploadSession>(completeUrl, {
        fileId: data.fileId
      });
    })).subscribe({
      error: () => {
        queuedUploadFile.failed();
        this._uploadQueue.next(this._files);
      }
    });
  }
}
