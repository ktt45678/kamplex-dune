import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubstringPipe } from './substring/substring.pipe';
import { CharColorPipe } from './char-color/char-color.pipe';
import { SplitPipe } from './split/split.pipe';

@NgModule({
  declarations: [
    SubstringPipe,
    CharColorPipe,
    SplitPipe
  ],
  imports: [CommonModule],
  exports: [
    SubstringPipe,
    CharColorPipe,
    SplitPipe
  ]
})
export class StringPipeModule { }
