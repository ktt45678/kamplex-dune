import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';

@Pipe({
  name: 'firstErrorKey'
})
export class FirstErrorKeyPipe implements PipeTransform {
  constructor(private translocoService: TranslocoService) { }

  transform(value: ValidationErrors | null, formName: string, inputName: string, params?: { [key: string]: string }): string {
    if (value) {
      const keys = Object.keys(value);
      if (keys.length) {
        return this.translocoService.translate(`validationErrors.${formName}.${inputName}.${keys[0]}`, params);
      }
    }
    return '';
  }

}
