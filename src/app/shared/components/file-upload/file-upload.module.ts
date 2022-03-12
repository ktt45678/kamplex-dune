import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

import { FileUploadComponent } from './file-upload.component';
import { FormDirectiveModule } from '../../directives/form-directive';

@NgModule({
  declarations: [FileUploadComponent],
  imports: [
    CommonModule,
    FormDirectiveModule,
    ButtonModule
  ],
  exports: [FileUploadComponent]
})
export class FileUploadModule { }
