import { AbstractControl, ValidationErrors } from '@angular/forms';
import { DateTime } from 'luxon';

export const shortDate = (dayControlName: string, monthControlName: string, yearControlName: string, required?: boolean, beforeDate?: Date) => {
  return (control: AbstractControl): ValidationErrors | null => {
    const dayControl = control.get(dayControlName);
    const monthControl = control.get(monthControlName);
    const yearControl = control.get(yearControlName);
    if (dayControl && monthControl && yearControl) {
      if (dayControl.value && monthControl.value && yearControl.value) {
        const date = DateTime.fromObject({ day: dayControl.value, month: monthControl.value, year: yearControl.value });
        if (!date.isValid) {
          dayControl.setErrors({ validShortDate: true });
          monthControl.setErrors({ validShortDate: true });
          yearControl.setErrors({ validShortDate: true });
          return null;
        }
        dayControl.setErrors(null);
        monthControl.setErrors(null);
        yearControl.setErrors(null);
        if (beforeDate) {
          const maxDate = DateTime.fromJSDate(beforeDate).startOf('day');
          if (date.startOf('day') >= maxDate) {
            dayControl.setErrors({ shortDateBefore: true });
            monthControl.setErrors({ shortDateBefore: true });
            yearControl.setErrors({ shortDateBefore: true });
          }
        } else {
          dayControl.setErrors(null);
          monthControl.setErrors(null);
          yearControl.setErrors(null);
        }
      } else if (required) {
        dayControl.setErrors({ required: true });
        monthControl.setErrors({ required: true });
        yearControl.setErrors({ required: true });
      }
    }
    return null;
  }
};
