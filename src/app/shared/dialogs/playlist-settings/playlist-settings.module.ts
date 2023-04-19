import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';

import { PlaylistSettingsComponent } from './playlist-settings.component';
import { FormDirectiveModule } from '../../directives/form-directive';
import { LazyloadImageExtraModule } from '../../directives/lazyload-image-extra';
import { ValidationPipeModule } from '../../pipes/validation-pipe';
import { NumberPipeModule } from '../../pipes/number-pipe';
import { ImageEditorModule } from '../image-editor';

@NgModule({
  declarations: [PlaylistSettingsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    LazyLoadImageModule,
    LazyloadImageExtraModule,
    ImageEditorModule,
    FormDirectiveModule,
    ValidationPipeModule,
    NumberPipeModule,
    DynamicDialogModule,
    RadioButtonModule,
    InputTextModule,
    InputTextareaModule,
    ProgressSpinnerModule,
    ButtonModule,
  ],
  exports: [PlaylistSettingsComponent]
})
export class PlaylistSettingsModule { }
