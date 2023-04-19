import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, Input, NgModule } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ToggleButton } from 'primeng/togglebutton';

export const TOGGLEBUTTON_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AltToggleButton),
  multi: true
};

@Component({
  selector: 'p-altToggleButton',
  template: `
        <div
            [ngClass]="{ 'p-button p-togglebutton p-component': true, 'p-button-icon-only': onIcon && offIcon && !hasOnLabel && !hasOffLabel, 'p-highlight': checked, 'p-disabled': disabled }"
            [ngStyle]="style"
            [class]="styleClass"
            (click)="toggle($event)"
            (keydown.enter)="toggle($event)"
            [attr.tabindex]="disabled ? null : '0'"
            role="checkbox"
            [attr.aria-checked]="checked"
            pRipple
        >
            <span *ngIf="onIcon || offIcon" [class]="checked ? this.onIcon : this.offIcon" [ngClass]="{ 'p-button-icon': true, 'p-button-icon-left': iconPos === 'left', 'p-button-icon-right': iconPos === 'right' }"></span>
            <span class="p-button-label" *ngIf="onLabel || offLabel">{{ checked ? (hasOnLabel ? onLabel : '') : hasOffLabel ? offLabel : '' }}</span>
        </div>
    `,
  providers: [TOGGLEBUTTON_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../../../../node_modules/primeng/resources/components/button/button.css'],
  host: {
    class: 'p-element'
  }
})
export class AltToggleButton extends ToggleButton implements ControlValueAccessor {

}

@NgModule({
  imports: [CommonModule],
  exports: [AltToggleButton],
  declarations: [AltToggleButton]
})
export class AltToggleButtonModule { }
