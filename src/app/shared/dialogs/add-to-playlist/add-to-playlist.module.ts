import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TranslocoModule } from '@ngneat/transloco';

import { AddToPlaylistComponent } from './add-to-playlist.component';
import { FormDirectiveModule } from '../../directives/form-directive';
import { ValidationPipeModule } from '../../pipes/validation-pipe';
import { AltCheckboxModule } from '../../../core/utils/primeng';

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
    AltCheckboxModule,
    RadioButtonModule,
    ProgressSpinnerModule
  ],
  exports: [AddToPlaylistComponent]
})
export class AddToPlaylistModule { }
