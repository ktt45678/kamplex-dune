import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, HostListener, Inject } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Directive({
  selector: '([formGroup])[formHandler]'
})
export class FormHandlerDirective {

  focusables = ['input', 'select', 'textarea'];

  constructor(@Inject(DOCUMENT) private document: Document, private formGroup: FormGroupDirective, private element: ElementRef) { }

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
    /*
    let submitButtonEl = this.element.nativeElement.querySelector('button[type="submit"]');
    if (!submitButtonEl) {
      const formElId = this.element.nativeElement.getAttribute('id');
      if (formElId) {
        submitButtonEl = this.document.querySelector(`button[type="submit"][form="${formElId}"]`);
      }
    }
    submitButtonEl?.focus();
    */
    const input = this.element.nativeElement.querySelector(this.focusables.map((x) => `${x}.ng-invalid`).join(','))
    if (input)
      input.focus();
  }

}
