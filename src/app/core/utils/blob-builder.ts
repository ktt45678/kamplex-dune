import { Observable } from 'rxjs';

export class BlobBuilder {
  private blob_?: Blob;
  private objectUrl_?: string;

  static fromFile(file: File) {
    const blobBuilder = new BlobBuilder();
    return new Observable<BlobBuilder | undefined>(observer => {
      const fr = new FileReader();
      fr.readAsArrayBuffer(file)
      fr.onload = function () {
        if (fr.result) {
          blobBuilder.blob_ = new Blob([fr.result], { type: file.type });
          blobBuilder.objectUrl_ = URL.createObjectURL(blobBuilder.blob_);
          observer.next(blobBuilder);
        } else {
          observer.next();
        }
        observer.complete();
      }
      fr.onerror = function () {
        observer.error('Error reading file');
        observer.complete();
      }
      fr.onabort = function () {
        observer.complete();
      }
    });
  }

  static fromBlob(blob: Blob) {
    const blobBuilder = new BlobBuilder();
    blobBuilder.blob_ = blob;
    blobBuilder.objectUrl_ = URL.createObjectURL(blobBuilder.blob_);
    return blobBuilder;
  }

  get blob() {
    return this.blob_;
  }

  get objectUrl() {
    return this.objectUrl_;
  }

  destroy() {
    if (this.objectUrl_)
      URL.revokeObjectURL(this.objectUrl_);
    if (this.blob_)
      this.blob_ = undefined;
  }

}
