import { Directive, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '([formControlName], [formControl])[disabledControl]'
})
export class DisabledControlDirective {
  @Input() set disabledControl(state: boolean) {
    const action = state ? 'disable' : 'enable';
    this.ngControl.control?.[action]();
  }

  constructor(private readonly ngControl: NgControl) { }
}
