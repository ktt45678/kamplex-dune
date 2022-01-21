import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '([formControlName])[controlAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {

  constructor(private element: ElementRef) { }

  ngAfterViewInit() {
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
