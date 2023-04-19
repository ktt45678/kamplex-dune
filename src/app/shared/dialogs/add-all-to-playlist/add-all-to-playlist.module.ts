import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AddAllToPlaylistComponent } from './add-all-to-playlist.component';
import { FormDirectiveModule } from '../../directives/form-directive';
import { ValidationPipeModule } from '../../pipes/validation-pipe';

@NgModule({
  declarations: [AddAllToPlaylistComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    FormDirectiveModule,
    ValidationPipeModule,
    InputTextModule,
    RadioButtonModule,
    ButtonModule,
    ProgressSpinnerModule
  ],
  exports: [AddAllToPlaylistComponent]
})
export class AddAllToPlaylistModule { }
