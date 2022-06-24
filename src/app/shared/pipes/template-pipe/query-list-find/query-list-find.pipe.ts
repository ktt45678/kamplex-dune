import { Pipe, PipeTransform, QueryList } from '@angular/core';

@Pipe({
  name: 'queryListFind'
})
export class QueryListFindPipe implements PipeTransform {

  transform<T>(value: QueryList<T>, key: string, match?: number | string): T | undefined {
    if (match === undefined) return undefined;
    return value.find(t => (<any>t)[key] === match);
  }

}
