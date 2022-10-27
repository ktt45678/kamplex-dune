import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArrayIncludesPipe } from './array-includes/array-includes.pipe';

@NgModule({
  declarations: [ArrayIncludesPipe],
  imports: [CommonModule],
  exports: [ArrayIncludesPipe]
})
export class ArrayPipeModule { }
