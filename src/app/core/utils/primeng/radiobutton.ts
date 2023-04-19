import { NgModule, Component, forwardRef, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { RadioButton } from 'primeng/radiobutton';

export const RADIO_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AltRadioButton),
  multi: true
};

@Component({
  selector: 'p-altRadioButton',
  template: `
        <div [ngStyle]="style" [ngClass]="{ 'p-radiobutton p-component': true, 'p-radiobutton-checked': checked, 'p-radiobutton-disabled': disabled, 'p-radiobutton-focused': focused }" [class]="styleClass">
            <div class="p-hidden-accessible">
                <input
                    #rb
                    type="radio"
                    [attr.id]="inputId"
                    [attr.name]="name"
                    [attr.value]="value"
                    [attr.tabindex]="tabindex"
                    [attr.aria-checked]="checked"
                    [attr.aria-label]="ariaLabel"
                    [attr.aria-labelledby]="ariaLabelledBy"
                    [checked]="checked"
                    (change)="onChange($event)"
                    (focus)="onInputFocus($event)"
                    (blur)="onInputBlur($event)"
                    [disabled]="disabled"
                />
            </div>
            <div (click)="handleClick($event, rb, true)" [ngClass]="{ 'p-radiobutton-box': true, 'p-highlight': checked, 'p-disabled': disabled, 'p-focus': focused }">
                <span class="p-radiobutton-icon"></span>
            </div>
        </div>
        <label
            (click)="select($event)"
            [class]="labelStyleClass"
            [ngClass]="{ 'p-radiobutton-label': true, 'p-radiobutton-label-active': rb.checked, 'p-disabled': disabled, 'p-radiobutton-label-focus': focused }"
            *ngIf="label"
            [attr.for]="inputId"
            >{{ label }}</label
        >
        <i *ngIf="icon" class="tw-cursor-pointer" [class]="icon" [ngClass]="{ 'p-disabled': disabled }"
          (click)="select($event)"></i>
    `,
  providers: [RADIO_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-element'
  }
})
export class AltRadioButton extends RadioButton implements ControlValueAccessor {

}

@NgModule({
  imports: [CommonModule],
  exports: [AltRadioButton],
  declarations: [AltRadioButton]
})
export class AltRadioButtonModule { }
