import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { ImageCropperModule } from '@ktt45678/ngx-image-cropper';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { SliderAltModule } from 'primeng/slideralt';

import { ImageEditorComponent } from './image-editor.component';
import { UrlPipeModule } from '../../pipes/url-pipe';

@NgModule({
  declarations: [ImageEditorComponent],
  imports: [
    CommonModule,
    TranslocoModule,
    ImageCropperModule,
    ProgressSpinnerModule,
    UrlPipeModule,
    ButtonModule,
    SliderAltModule
  ],
  exports: [ImageEditorComponent]
})
export class ImageEditorModule { }
