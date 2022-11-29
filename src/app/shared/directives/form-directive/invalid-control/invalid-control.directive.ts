import { Directive, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Directive({
  selector: '[invalidControl]',
  host: {
    'class': 'tw-transition-opacity tw-duration-200 before:tw-content-invisible',
    '[class]': '(invalidControl.dirty || invalidControl.touched) && invalidControl.invalid ? "tw-opacity-100" : "tw-opacity-0"'
  }
})
export class InvalidControlDirective {
  @Input() invalidControl!: FormControl | FormGroup;

  constructor() { }
}
