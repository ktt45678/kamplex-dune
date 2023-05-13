import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextResizeDirective } from './text-resize/text-resize.directive';

@NgModule({
  declarations: [TextResizeDirective],
  imports: [CommonModule],
  exports: [TextResizeDirective]
})
export class TextDirectiveModule { }
