import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToStringPipe } from './to-string/to-string.pipe';
import { HexColorPipe } from './hex-color/hex-color.pipe';

@NgModule({
  declarations: [
    ToStringPipe,
    HexColorPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ToStringPipe,
    HexColorPipe
  ]
})
export class NumberPipeModule { }
