import { NgModule, Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { SelectButton } from 'primeng/selectbutton';

@Component({
  selector: 'p-altSelectButton',
  template: `
    <div [ngClass]="'p-selectbutton p-buttonset p-component'" [ngStyle]="style" [class]="styleClass" role="group">
        <div
            *ngFor="let option of options; let i = index"
            #btn
            class="p-button p-component"
            [class]="option.styleClass"
            role="button"
            [attr.aria-pressed]="isSelected(option)"
            [ngClass]="{ 'p-highlight': isSelected(option), 'p-disabled': disabled || isOptionDisabled(option), 'p-button-icon-only': option.icon && !getOptionLabel(option) }"
            (click)="onItemClick($event, option, i)"
            (keydown.enter)="onItemClick($event, option, i)"
            [attr.title]="option.title"
            [attr.aria-label]="option.label"
            (blur)="onBlur()"
            [attr.tabindex]="disabled ? null : tabindex"
            [attr.aria-labelledby]="this.getOptionLabel(option)"
            pRipple
        >
            <ng-container *ngIf="!itemTemplate; else customcontent">
                <span [ngClass]="'p-button-icon p-button-icon-left'" [class]="option.icon" *ngIf="option.icon"></span>
                <span class="p-button-label">{{ getOptionLabel(option) }}</span>
            </ng-container>
            <ng-template #customcontent>
                <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: option, index: i }"></ng-container>
            </ng-template>
        </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../../../../node_modules/primeng/resources/components/button/button.css'],
  host: {
    class: 'p-element'
  }
})
export class AltSelectButton extends SelectButton {
  @Input() override value: any;
}

@NgModule({
  imports: [CommonModule, RippleModule],
  exports: [AltSelectButton],
  declarations: [AltSelectButton]
})
export class AltSelectButtonModule { }
