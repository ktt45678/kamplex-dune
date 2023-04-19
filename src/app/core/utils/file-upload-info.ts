import { Subscription } from 'rxjs';

import { QueueUploadStatus } from '../enums/queue-upload-status.enum';

export class FileUpload {
  public id: string;
  public status: QueueUploadStatus;
  public progress: number;
  public file: File;
  public createUrl: string;
  public completeUrl: string;
  private _subscription?: Subscription;

  constructor(id: string, file: File, createUrl: string, completeUrl: string) {
    this.id = id;
    this.status = QueueUploadStatus.PENDING;
    this.progress = 0;
    this.file = file;
    this.createUrl = createUrl;
    this.completeUrl = completeUrl;
  }

  public updateProgress(progress: number) {
    this.progress = progress;
    this.status = QueueUploadStatus.UPLOADING;
  }

  public completed() {
    this.progress = 100;
    this.status = QueueUploadStatus.DONE;
  }

  public failed() {
    this.progress = 0;
    this.status = QueueUploadStatus.ERROR;
  }

  public cancel() {
    if (this._subscription && !this._subscription.closed) {
      this._subscription.unsubscribe();
      this.status = QueueUploadStatus.ABORT;
    }
  }

  public abort() {
    this.status = QueueUploadStatus.ABORT;
  }

  get isWaitingForUpload() {
    return this.status === QueueUploadStatus.PENDING;
  }

  set subscription(value: Subscription) {
    this._subscription = value;
  }
}
