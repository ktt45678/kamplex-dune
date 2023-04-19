import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubstringPipe } from './substring/substring.pipe';
import { CharColorPipe } from './char-color/char-color.pipe';

@NgModule({
  declarations: [
    SubstringPipe,
    CharColorPipe
  ],
  imports: [CommonModule],
  exports: [
    SubstringPipe,
    CharColorPipe
  ]
})
export class StringPipeModule { }
