import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToStringPipe } from './to-string/to-string.pipe';
import { HexColorPipe } from './hex-color/hex-color.pipe';
import { RgbColorPipe } from './rgb-color/rgb-color.pipe';

@NgModule({
  declarations: [
    ToStringPipe,
    HexColorPipe,
    RgbColorPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ToStringPipe,
    HexColorPipe,
    RgbColorPipe
  ]
})
export class NumberPipeModule { }
