import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, Input, NgModule, OnInit, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';

export const CHECKBOX_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AltCheckbox),
  multi: true
};

@Component({
  selector: 'p-altCheckbox',
  template: `
        <div [ngStyle]="style" [ngClass]="{ 'p-checkbox p-component': true, 'p-checkbox-checked': checked(), 'p-checkbox-disabled': disabled, 'p-checkbox-focused': focused }" [class]="styleClass">
            <div class="p-hidden-accessible">
                <input
                    #cb
                    type="checkbox"
                    [attr.id]="inputId"
                    [attr.name]="name"
                    [readonly]="readonly"
                    [value]="value"
                    [checked]="checked()"
                    (focus)="onFocus()"
                    (blur)="onBlur()"
                    (change)="handleChange($event)"
                    [disabled]="disabled"
                    [attr.tabindex]="tabindex"
                    [attr.aria-labelledby]="ariaLabelledBy"
                    [attr.aria-label]="ariaLabel"
                    [attr.aria-checked]="checked()"
                    [attr.required]="required"
                />
            </div>
            <div class="p-checkbox-box" (click)="onClick($event, cb, true)" [ngClass]="{ 'p-highlight': checked(), 'p-disabled': disabled, 'p-focus': focused }">
                <span class="p-checkbox-icon" [ngClass]="checked() ? checkboxIcon : null"></span>
            </div>
        </div>
        <label
            (click)="onClick($event, cb, true)"
            [class]="labelStyleClass"
            [ngClass]="{ 'p-checkbox-label': true, 'p-checkbox-label-active': checked(), 'p-disabled': disabled, 'p-checkbox-label-focus': focused }"
            *ngIf="label"
            [attr.for]="inputId"
            >{{ label }}</label
        >
        <i *ngIf="icon" class="tw-cursor-pointer" [class]="icon" [ngClass]="{ 'p-disabled': disabled }"
          (click)="onClick($event, cb, true)"></i>
    `,
  providers: [CHECKBOX_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../../../../node_modules/primeng/resources/components/checkbox/checkbox.css'],
  host: {
    class: 'p-element'
  }
})
export class AltCheckbox extends Checkbox implements OnInit, ControlValueAccessor {

}

@NgModule({
  imports: [CommonModule],
  exports: [AltCheckbox],
  declarations: [AltCheckbox]
})
export class AltCheckboxModule { }
