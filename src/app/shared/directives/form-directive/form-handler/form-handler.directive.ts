import { Directive, ElementRef, HostListener } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Directive({
  selector: '([formGroup])[formHandler]'
})
export class FormHandlerDirective {

  focusables = ['input', 'select', 'textarea'];

  constructor(private formGroup: FormGroupDirective, private element: ElementRef) { }

  /*
  @HostListener('document:keydown.enter', ['$event'])
  enterKeydown(e: KeyboardEvent) {
    e.preventDefault();
    this.formGroup.ngSubmit.emit(e);
    this.submit();
  }

  @HostListener('document:keydown.shift.enter', ['$event'])
  shiftEnterKeydown(e: KeyboardEvent) {
    e.preventDefault();
    this.formGroup.ngSubmit.emit(e);
    this.submit();
  }
  */

  @HostListener('submit')
  submit() {
    this.formGroup.form.markAllAsTouched();
    const input = this.element.nativeElement.querySelector(this.focusables.map((x) => `${x}.ng-invalid`).join(','))
    if (input)
      input.focus();
  }

}
