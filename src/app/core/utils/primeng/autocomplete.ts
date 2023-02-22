import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, NgModule, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayModule } from 'primeng/overlay';
import { RippleModule } from 'primeng/ripple';
import { ScrollerModule } from 'primeng/scroller';
import { AutoComplete } from 'primeng/autocomplete';
import { ObjectUtils } from 'primeng/utils';

export const AUTOCOMPLETE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AltAutoComplete),
  multi: true
};

@Component({
  selector: 'p-altAutoComplete',
  template: `
        <span #container [ngClass]="{ 'tw-w-full': true, 'p-autocomplete p-component': true, 'p-autocomplete-dd': dropdown, 'p-autocomplete-multiple': multiple }" [ngStyle]="style" [class]="styleClass">
            <input
                pAutoFocus
                [autofocus]="autofocus"
                *ngIf="!multiple"
                #in
                [attr.type]="type"
                [attr.id]="inputId"
                [ngStyle]="inputStyle"
                [class]="inputStyleClass"
                [autocomplete]="autocomplete"
                [attr.required]="required"
                [attr.name]="name"
                class="p-autocomplete-input p-inputtext p-component"
                [ngClass]="{ 'p-autocomplete-dd-input': dropdown, 'p-disabled': disabled }"
                [value]="inputFieldValue"
                aria-autocomplete="list"
                role="searchbox"
                (click)="onInputClick($event)"
                (input)="onInput($event)"
                (keydown)="onKeydown($event)"
                (keyup)="onKeyup($event)"
                (focus)="onInputFocus($event)"
                (blur)="onInputBlur($event)"
                (change)="onInputChange($event)"
                (paste)="onInputPaste($event)"
                [attr.placeholder]="placeholder"
                [attr.size]="size"
                [attr.maxlength]="maxlength"
                [attr.tabindex]="tabindex"
                [readonly]="readonly"
                [disabled]="disabled"
                [attr.aria-label]="ariaLabel"
                [attr.aria-labelledby]="ariaLabelledBy"
                [attr.aria-required]="required"
            />
            <i *ngIf="!multiple && filled && !disabled && showClear" class="p-autocomplete-clear-icon pi pi-times" (click)="clear()"></i>
            <i *ngIf="multiple && filled && !disabled && showClear" class="p-autocomplete-clear-icon pi pi-times" (click)="clear()"></i>
            <ul *ngIf="multiple" #multiContainer class="p-autocomplete-multiple-container p-component p-inputtext !tw-flex-nowrap" [ngClass]="{ 'p-disabled': disabled, 'p-focus': focus }" (click)="multiIn.focus()">
                <li *ngIf="!focus && value?.length" class="p-autocomplete-token">
                    <ng-container *ngTemplateOutlet="selectedItemTemplate; context: { $implicit: value }"></ng-container>
                    <span *ngIf="!selectedItemTemplate" class="p-autocomplete-token-label">+{{ value.length }}</span>
                </li>
                <li class="p-autocomplete-input-token">
                    <input
                        pAutoFocus
                        [autofocus]="autofocus"
                        #multiIn
                        [attr.type]="type"
                        [attr.id]="inputId"
                        [disabled]="disabled"
                        [attr.placeholder]="value && value.length ? null : placeholder"
                        [attr.tabindex]="tabindex"
                        [attr.maxlength]="maxlength"
                        (input)="onInput($event)"
                        (click)="onInputClick($event)"
                        (keydown)="onKeydown($event)"
                        [readonly]="readonly"
                        (keyup)="onKeyup($event)"
                        (focus)="onInputFocus($event)"
                        (blur)="onInputBlur($event)"
                        (change)="onInputChange($event)"
                        (paste)="onInputPaste($event)"
                        [autocomplete]="autocomplete"
                        [ngStyle]="inputStyle"
                        [class]="inputStyleClass"
                        [attr.aria-label]="ariaLabel"
                        [attr.aria-labelledby]="ariaLabelledBy"
                        [attr.aria-required]="required"
                        aria-autocomplete="list"
                        [attr.aria-controls]="listId"
                        role="searchbox"
                        [attr.aria-expanded]="overlayVisible"
                        aria-haspopup="true"
                        [attr.aria-activedescendant]="'p-highlighted-option'"
                    />
                </li>
            </ul>
            <i *ngIf="loading" class="p-autocomplete-loader pi pi-spinner pi-spin"></i
            ><button
                #ddBtn
                type="button"
                pButton
                [icon]="dropdownIcon"
                [attr.aria-label]="dropdownAriaLabel"
                class="p-autocomplete-dropdown"
                [disabled]="disabled"
                pRipple
                (click)="handleDropdownClick($event)"
                *ngIf="dropdown"
                [attr.tabindex]="tabindex"
            ></button>
            <p-overlay
                #overlay
                [(visible)]="overlayVisible"
                [options]="virtualScrollOptions"
                [target]="'@parent'"
                [appendTo]="appendTo"
                [showTransitionOptions]="showTransitionOptions"
                [hideTransitionOptions]="hideTransitionOptions"
                (onAnimationStart)="onOverlayAnimationStart($event)"
                (onShow)="show($event)"
                (onHide)="hide($event)"
            >
                <div [ngClass]="['p-autocomplete-panel p-component tw-max-w-[100vw]']" [style.max-height]="virtualScroll ? 'auto' : scrollHeight" [ngStyle]="panelStyle" [class]="panelStyleClass">
                    <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
                    <p-scroller
                        *ngIf="virtualScroll"
                        #scroller
                        [items]="suggestions"
                        [style]="{ height: scrollHeight }"
                        [itemSize]="virtualScrollItemSize || _itemSize"
                        [autoSize]="true"
                        [lazy]="lazy"
                        (onLazyLoad)="onLazyLoad.emit($event)"
                        [options]="virtualScrollOptions"
                    >
                        <ng-template pTemplate="content" let-items let-scrollerOptions="options">
                            <ng-container *ngTemplateOutlet="buildInItems; context: { $implicit: items, options: scrollerOptions }"></ng-container>
                        </ng-template>
                        <ng-container *ngIf="loaderTemplate">
                            <ng-template pTemplate="loader" let-scrollerOptions="options">
                                <ng-container *ngTemplateOutlet="loaderTemplate; context: { options: scrollerOptions }"></ng-container>
                            </ng-template>
                        </ng-container>
                    </p-scroller>
                    <ng-container *ngIf="!virtualScroll">
                        <ng-container *ngTemplateOutlet="buildInItems; context: { $implicit: suggestions, options: {} }"></ng-container>
                    </ng-container>

                    <ng-template #buildInItems let-items let-scrollerOptions="options">
                        <ul #items role="listbox" [attr.id]="listId" class="p-autocomplete-items" [ngClass]="scrollerOptions.contentStyleClass" [style]="scrollerOptions.contentStyle">
                            <ng-container *ngIf="group">
                                <ng-template ngFor let-optgroup [ngForOf]="items">
                                    <li class="p-autocomplete-item-group" [ngStyle]="{ height: scrollerOptions.itemSize + 'px' }">
                                        <span *ngIf="!groupTemplate">{{ getOptionGroupLabel(optgroup) || 'empty' }}</span>
                                        <ng-container *ngTemplateOutlet="groupTemplate; context: { $implicit: optgroup }"></ng-container>
                                    </li>
                                    <ng-container *ngTemplateOutlet="itemslist; context: { $implicit: getOptionGroupChildren(optgroup) }"></ng-container>
                                </ng-template>
                            </ng-container>
                            <ng-container *ngIf="!group">
                                <ng-container *ngTemplateOutlet="itemslist; context: { $implicit: items }"></ng-container>
                            </ng-container>
                            <ng-template #itemslist let-suggestionsToDisplay>
                                <li
                                    role="option"
                                    *ngFor="let option of suggestionsToDisplay; let idx = index"
                                    class="p-autocomplete-item tw-flex tw-items-center"
                                    pRipple
                                    [ngStyle]="{ height: scrollerOptions.itemSize + 'px' }"
                                    [ngClass]="{ 'p-highlight': option === highlightOption }"
                                    [id]="highlightOption == option ? 'p-highlighted-option' : ''"
                                    (click)="isSelected(option) ? removeItemByObject(option) : selectItem(option)"
                                >
                                  <div *ngIf="!itemTemplate; else hasItemTemplate" class="tw-flex-1">
                                    <span >{{ resolveFieldData(option) }}</span>
                                  </div>
                                  <ng-template #hasItemTemplate>
                                    <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: option, index: scrollerOptions.getOptions ? scrollerOptions.getOptions(idx) : idx }"></ng-container>
                                  </ng-template>
                                  <i *ngIf="isSelected(option)" class="ms ms-check ms-icon-md tw-ml-auto"></i>
                                </li>
                            </ng-template>
                            <li *ngIf="noResults && showEmptyMessage" class="p-autocomplete-empty-message" [ngStyle]="{ height: scrollerOptions.itemSize + 'px' }">
                                <ng-container *ngIf="!emptyTemplate; else empty">
                                    {{ emptyMessageLabel }}
                                </ng-container>
                                <ng-template #empty>
                                  <ng-container *ngTemplateOutlet="emptyTemplate"></ng-container>
                                </ng-template>
                            </li>
                        </ul>
                    </ng-template>
                    <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
                </div>
            </p-overlay>
        </span>
    `,
  animations: [trigger('overlayAnimation', [transition(':enter', [style({ opacity: 0, transform: 'scaleY(0.8)' }), animate('{{showTransitionParams}}')]), transition(':leave', [animate('{{hideTransitionParams}}', style({ opacity: 0 }))])])],
  host: {
    class: 'p-element p-inputwrapper',
    '[class.p-inputwrapper-filled]': 'filled',
    '[class.p-inputwrapper-focus]': '((focus && !disabled) || autofocus) || overlayVisible',
    '[class.p-autocomplete-clearable]': 'showClear && !disabled'
  },
  providers: [AUTOCOMPLETE_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../../../../node_modules/primeng/resources/components/autocomplete/autocomplete.css']
})
export class AltAutoComplete extends AutoComplete {
  removeItemByObject(item: any) {
    if (this.value && this.value.length) {
      if (this.dataKey) {
        const itemValue = ObjectUtils.resolveFieldData(item, this.dataKey);
        this.value = this.value.filter((val: any) => ObjectUtils.resolveFieldData(val, this.dataKey) != itemValue);
      } else {
        this.value = this.value.filter((val: any) => val != item);
      }
      const removedValue = item;
      this.onModelChange(this.value);
      this.updateFilledState();
      this.onUnselect.emit(removedValue);
    }
  }
}

@NgModule({
  imports: [CommonModule, OverlayModule, InputTextModule, ButtonModule, SharedModule, RippleModule, ScrollerModule, AutoFocusModule],
  exports: [AltAutoComplete, OverlayModule, SharedModule, ScrollerModule, AutoFocusModule],
  declarations: [AltAutoComplete]
})
export class AltAutoCompleteModule { }
