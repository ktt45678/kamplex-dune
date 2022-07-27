import { AbstractControl, ValidationErrors } from '@angular/forms';
import { isValid, startOfDay } from 'date-fns';

export const shortDate = (dayControlName: string, monthControlName: string, yearControlName: string, required?: boolean, beforeDate?: Date) => {
  return (control: AbstractControl): ValidationErrors | null => {
    const dayControl = control.get(dayControlName);
    const monthControl = control.get(monthControlName);
    const yearControl = control.get(yearControlName);
    if (dayControl && monthControl && yearControl) {
      if (dayControl.value && monthControl.value && yearControl.value) {
        const date = new Date(yearControl.value, monthControl.value - 1, dayControl.value);
        if (!isValid(date) || date.getMonth() !== monthControl.value - 1) {
          return { validShortDate: true };
        }
        if (beforeDate) {
          const maxDate = startOfDay(beforeDate);
          if (startOfDay(date) >= maxDate) {
            return { shortDateBefore: true };
          }
        }
      } else if (required && !dayControl.dirty && !monthControl.dirty && !yearControl.dirty) {
        return { required: true };
      }
    }
    return null;
  }
};
