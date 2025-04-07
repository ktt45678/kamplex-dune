import { Directive, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTemplateFor]'
})
export class TemplateForDirective {
  type = input<string | undefined>();
  name = input<string | undefined>(undefined, { alias: 'appTemplateFor' });

  constructor(public template: TemplateRef<any>) { }

  getType(): string {
    return this.name()!;
  }
}
