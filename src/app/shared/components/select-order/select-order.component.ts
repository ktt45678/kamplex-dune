import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslocoTranslateFn } from '@ngneat/transloco';
import { remove } from 'lodash-es';

import { SelectOption } from '../../../core/interfaces/primeng';

@Component({
  selector: 'app-select-order',
  templateUrl: './select-order.component.html',
  styleUrl: './select-order.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SelectOrderComponent,
      multi: true
    }
  ]
})
export class SelectOrderComponent implements ControlValueAccessor {
  t = input.required<TranslocoTranslateFn>();
  options = input<SelectOption[]>([]);
  optionLabel = input<string | undefined>();
  optionValue = input<string | undefined>();
  fixedValue = input<string | undefined>();
  styleClass = input<string>('');

  optionAdded = output<SelectOption>();
  optionRemoved = output<SelectOption>();

  disabled = signal<boolean>(false);
  touched = signal<boolean>(false);
  selectedOptions = signal<SelectOption[]>([]);
  availableOptions = computed<SelectOption[]>(() => this.getAvailableOptions(this.options(), this.selectedOptions()));

  private _lazyInitValue: any[] = [];

  constructor() {
    const lazyInitValueEffect = effect(() => {
      const options = this.options();
      if (!options.length) return;
      const optionValue = untracked(this.optionValue);
      const selectedOptions = this.getSelectedOptions(this._lazyInitValue, options, optionValue);
      this.selectedOptions.set(selectedOptions);
      lazyInitValueEffect.destroy();
    }, { allowSignalWrites: true, manualCleanup: true });
  }

  getAvailableOptions(options: SelectOption[], selectedOptions: SelectOption[]) {
    const disableRemoveValue = this.fixedValue();
    const filteredList = disableRemoveValue ? options.filter(l => l.value !== disableRemoveValue) : options;
    return filteredList.map(l => {
      return { ...l, disabled: selectedOptions.some(sl => sl.value === l.value) };
    });
  }

  addOption(addValue: any) {
    this.selectedOptions.update(value => [addValue, ...value]);
    this.onChange(this.getSelectedOptionValues());
    this.optionAdded.emit(addValue);
  }

  removeOption(removeValue: any) {
    this.selectedOptions.update(value => remove(value, l => l.value !== removeValue.value));
    this.onChange(this.getSelectedOptionValues());
    this.optionRemoved.emit(removeValue);
  }

  dropOption(event: CdkDragDrop<string[]>) {
    moveItemInArray<SelectOption>(this.selectedOptions(), event.previousIndex, event.currentIndex);
    this.onChange(this.getSelectedOptionValues());
  }

  getSelectedOptionValues() {
    const optionValue = this.optionValue();
    if (!optionValue) {
      return this.selectedOptions();
    }
    return this.selectedOptions().map(o => (<any>o)[optionValue]);
  }

  getSelectedOption(value: any, options: SelectOption[], optionValue?: string) {
    if (!optionValue)
      return value;
    const valueOption = options.find(o => value === (<any>o)[optionValue]);
    if (!valueOption)
      return null
    return valueOption;
  }

  getSelectedOptions(value: any[], options: SelectOption[], optionValue?: string) {
    const selectedOptions = [];
    for (let i = 0; i < value.length; i++) {
      const valueOption = this.getSelectedOption(value[i], options, optionValue);
      if (!valueOption)
        continue;
      selectedOptions.push(valueOption);
    }
    return selectedOptions;
  }

  writeValue(value: any[]): void {
    this._lazyInitValue = value;
    const options = this.options();
    if (!options.length) return;
    const optionValue = this.optionValue();
    const selectedOptions = this.getSelectedOptions(value, options, optionValue);
    this.selectedOptions.set(selectedOptions);
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  setDisabledState(value: boolean): void {
    this.disabled.set(value);
  }

  markAsTouched() {
    if (!this.touched()) {
      this.onTouched();
      this.touched.set(true);
    }
  }

  onChange = (value: SelectOption[]) => { };

  onTouched = () => { };
}
