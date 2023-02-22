import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';

import { MediaFilterComponent } from './media-filter.component';
import { MediaFilterService } from './media-filter.service';
import { AltAutoCompleteModule, AltChipModule, AltToggleButtonModule, AltTooltipModule } from '../../../core/utils/primeng';
import { CdkMenuCustomModule } from '../../directives/cdk-menu-custom';
import { FormDirectiveModule } from '../../directives/form-directive';

@NgModule({
  declarations: [MediaFilterComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TranslocoModule,
    CdkMenuCustomModule,
    FormDirectiveModule,
    ButtonModule,
    DropdownModule,
    AltAutoCompleteModule,
    AltToggleButtonModule,
    AltTooltipModule,
    AltChipModule,
    InputTextModule,
    ChipModule
  ],
  providers: [MediaFilterService],
  exports: [MediaFilterComponent]
})
export class MediaFilterModule { }
