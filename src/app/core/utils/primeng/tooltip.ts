import { CommonModule } from '@angular/common';
import { Directive, Input, NgModule } from '@angular/core';
import { Tooltip, TooltipOptions } from 'primeng/tooltip';

@Directive({
  selector: '[pAltTooltip]',
  host: {
    class: 'p-element'
  }
})
export class AltTooltip extends Tooltip {
  @Input('pAltTooltip') override text!: string;

  override _tooltipOptions: TooltipOptions = {
    tooltipPosition: 'top',
    tooltipEvent: 'hover',
    appendTo: 'body',
    tooltipZIndex: 'auto',
    escape: true,
    positionTop: 0,
    positionLeft: 0,
    autoHide: true
  };
}

@NgModule({
  imports: [CommonModule],
  exports: [AltTooltip],
  declarations: [AltTooltip]
})
export class AltTooltipModule { }
