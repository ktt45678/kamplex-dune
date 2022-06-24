import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appPanelToast]'
})
export class PanelToastDirective {
  @Input() tabId?: number | string;
  @Input() visible: boolean = false;
  @Input() styleClass: string = '';

  constructor(public template: TemplateRef<any>) { }

}
