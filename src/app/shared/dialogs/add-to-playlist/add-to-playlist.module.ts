import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AddToPlaylistComponent } from './add-to-playlist.component';
import { FormDirectiveModule } from '../../directives/form-directive';
import { ValidationPipeModule } from '../../pipes/validation-pipe';

@NgModule({
  declarations: [AddToPlaylistComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    FormDirectiveModule,
    ValidationPipeModule,
    InputTextModule,
    ButtonModule,
    RadioButtonModule,
    CheckboxModule,
    ProgressSpinnerModule
  ],
  exports: [AddToPlaylistComponent]
})
export class AddToPlaylistModule { }
