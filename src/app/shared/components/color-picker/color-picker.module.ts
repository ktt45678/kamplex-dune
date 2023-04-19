import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerModule as PrimeColorPickerModule } from 'primeng/colorpicker';

import { ColorPickerComponent } from './color-picker.component';

@NgModule({
  declarations: [
    ColorPickerComponent
  ],
  imports: [
    CommonModule,
    PrimeColorPickerModule
  ],
  exports: [
    ColorPickerComponent
  ]
})
export class ColorPickerModule { }
