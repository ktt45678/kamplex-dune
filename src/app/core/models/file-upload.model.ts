import { QueueUploadStatus } from '../enums/queue-upload-status.enum';

export class FileUpload {
  public status: QueueUploadStatus;
  public progress: number;

  constructor(public file: File, public createUrl: string, public completeUrl: string) {
    this.status = QueueUploadStatus.PENDING;
    this.progress = 0;
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

  get isWaitingForUpload() {
    return this.status === QueueUploadStatus.PENDING;
  }
}
