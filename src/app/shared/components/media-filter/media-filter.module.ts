import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import {TooltipModule} from 'primeng/tooltip';

import { MediaFilterComponent } from './media-filter.component';
import { MediaFilterService } from './media-filter.service';

@NgModule({
  declarations: [MediaFilterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    InputTextModule,
    ToggleButtonModule,
    TooltipModule
  ],
  providers: [MediaFilterService],
  exports: [MediaFilterComponent]
})
export class MediaFilterModule { }
