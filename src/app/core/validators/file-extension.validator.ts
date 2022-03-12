import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function fileExtension(ext: string | string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    let forbidden = true;
    const name: string = control.value.name;
    if (Array.isArray(ext)) {
      for (let i = 0; i < ext.length; i++) {
        if (name.substring(name.length - ext[i].length).toLowerCase() === ext[i].toLowerCase()) {
          forbidden = false;
          break;
        }
      }
    } else {
      if (name.substring(name.length - ext.length).toLowerCase() === ext.toLowerCase()) {
        forbidden = false;
      }
    }
    return forbidden ? { fileExtension: { value: control.value.name } } : null;
  };
}
