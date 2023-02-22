import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isTypeOf'
})
export class IsTypeOfPipe implements PipeTransform {

  transform(value: any, type: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function') {
    return typeof value === type;
  }

}
