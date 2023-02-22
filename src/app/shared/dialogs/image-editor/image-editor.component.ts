import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ImageCroppedEvent, ImageCropperComponent, ImageTransform, LoadedImage, OutputFormat } from '@ktt45678/ngx-image-cropper';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

import { ImageEditorConfig } from './image-editor-config.interface';
import { getImageFormat } from '../../../core/utils';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'common'
    }
  ]
})
export class ImageEditorComponent {
  @ViewChild(ImageCropperComponent) imageCropper?: ImageCropperComponent;
  aspectRatioWidth: number;
  aspectRatioHeight: number;
  aspectRatio: number;
  minWidth: number;
  minHeight: number;
  imageFile: File;
  format: OutputFormat;
  transform: ImageTransform;
  imageBase64?: string;
  loadedImage: boolean = false;

  constructor(private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig<ImageEditorConfig>) {
    this.aspectRatioWidth = this.config.data!.aspectRatioWidth;
    this.aspectRatioHeight = this.config.data!.aspectRatioHeight;
    this.minWidth = this.config.data!.minWidth;
    this.minHeight = this.config.data!.minHeight;
    this.imageFile = this.config.data!.imageFile;
    const maxSize = this.config.data!.maxSize || 5242880; //5 MiB
    this.format = this.imageFile.size <= maxSize ? getImageFormat(this.imageFile.type) : 'jpeg';
    this.transform = {};
    this.aspectRatio = this.aspectRatioWidth / this.aspectRatioHeight;
  }

  zoomSliderChange(event: any): void {
    this.transform = { scale: 1 + event.value / 50 };
  }

  onSkip(): void {
    if (!this.imageCropper) return;
    this.dialogRef.close([this.imageBase64, this.imageFile.name]);
  }

  onConfirm(): void {
    if (!this.imageCropper) return;
    const cropped = this.imageCropper.crop();
    if (!cropped) {
      this.dialogRef.close(null);
      return;
    }
    const ext = this.format === 'jpeg' ? 'jpg' : 'png';
    const filename = this.imageFile.name.split('.')[0] + '.' + ext;
    this.dialogRef.close([cropped.base64, filename]);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  imageLoaded(event: LoadedImage): void {
    this.imageBase64 = event.original.base64;
    this.loadedImage = true;
  }

  loadImageFailed(): void {

  }

  imageCropped(event: ImageCroppedEvent): void {

  }

  findMatchingDimension() {

  }
}
