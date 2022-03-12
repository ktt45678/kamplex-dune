import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AutofocusDirective } from './autofocus/autofocus.directive';
import { FormAutofocusDirective } from './form-autofocus/form-autofocus.directive';
import { DisabledControlDirective } from './disabled-control/disabled-control.directive';
import { FormHandlerDirective } from './form-handler/form-handler.directive';
import { DragDropFileDirective } from './drap-drop-file/drag-drop-file.directive';

@NgModule({
  declarations: [
    AutofocusDirective,
    FormAutofocusDirective,
    DisabledControlDirective,
    FormHandlerDirective,
    DragDropFileDirective
  ],
  imports: [CommonModule],
  exports: [
    AutofocusDirective,
    FormAutofocusDirective,
    DisabledControlDirective,
    FormHandlerDirective,
    DragDropFileDirective
  ]
})
export class FormDirectiveModule { }
