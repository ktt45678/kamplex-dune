import { AbstractControl, ValidationErrors } from '@angular/forms';

export const controlMatches = (controlName: string, matchingControlName: string) => {
  return (control: AbstractControl): ValidationErrors | null => {
    const sourceControl = control.get(controlName);
    const matchingControl = control.get(matchingControlName);
    if (sourceControl && matchingControl && sourceControl.value !== matchingControl.value)
      sourceControl.setErrors({ controlMatches: true });
    return null;
  }
};
