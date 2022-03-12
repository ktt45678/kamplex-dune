import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function maxFileSize(size: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const forbidden = control.value.size > size;
    return forbidden ? { maxFileSize: { value: control.value.size } } : null;
  };
}
