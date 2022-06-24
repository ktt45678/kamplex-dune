import { Directive, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTabPanel]'
})
export class TabPanelDirective {
  @Input() label: string = '';
  @Input() separator: boolean = false;
  @Input() id?: number | string;

  constructor(public template: TemplateRef<any>) { }
}
