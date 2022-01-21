import { ElementRef } from '@angular/core';
import { FormAutofocusDirective } from './form-autofocus.directive';

describe('FormAutofocusDirective', () => {
  it('should create an instance', () => {
    const element = new ElementRef(new Element());
    const directive = new FormAutofocusDirective(element);
    expect(directive).toBeTruthy();
  });
});
