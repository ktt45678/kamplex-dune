import { NgForOf } from '@angular/common';
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[ngFor][ngForRepeat]'
})
export class NgForRepeatDirective<T> extends NgForOf<T> {
  @Input() set ngForRepeat(count: number) {
    this.ngForOf = new Array(Number.isInteger(count) ? count : 0);
  }
}
