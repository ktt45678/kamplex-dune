import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '([formControlName])[controlAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {

  constructor(private element: ElementRef) { }

  ngAfterViewInit() {
    const el = this.element.nativeElement instanceof HTMLInputElement
      ? this.element.nativeElement
      : this.element.nativeElement.getElementsByTagName('input')[0];
    if (!el) return;
    // For iOS devices
    if (navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
      this.element.nativeElement.setAttribute('autofocus', '');
      return;
    }
    setTimeout(() => {
      this.element.nativeElement.focus();
    }, 0);
  }
}
