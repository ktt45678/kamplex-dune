import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { ColorPickerData } from '../../../core/interfaces/options';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ColorPickerComponent,
      multi: true
    }
  ]
})
export class ColorPickerComponent implements ControlValueAccessor {
  @Input() styleClass?: string;
  value: string | null = null;
  disabled: boolean = false;
  presetColors: ColorPickerData[];
  selectedColorIndex?: number;

  onChange = (_: string | null) => { };
  onTouched = () => { };

  constructor(private ref: ChangeDetectorRef) {
    this.presetColors = [
      {
        label: 'green',
        value: '#16a34a'
      },
      {
        label: 'blue',
        value: '#0000ff'
      },
      {
        label: 'yellow',
        value: '#facc15'
      },
      {
        label: 'red',
        value: '#dc2626'
      },
      {
        label: 'gray',
        value: '#6b7280'
      }
    ]
  }

  updateUI(): void {
    const selectedPresetColor = this.value ?
      this.presetColors.findIndex(c => c.value.toLowerCase() === this.value!.toLowerCase()) : -1;
    this.selectedColorIndex = selectedPresetColor > -1 ? selectedPresetColor : undefined;
    this.ref.markForCheck();
  }

  setDefaultColor(): void {
    this.value = null;
    this.selectedColorIndex = undefined;
    this.onChange(null);
  }

  setCustomColor(color: string | object): void {
    if (typeof color === 'object') return;
    this.value = color;
    this.selectedColorIndex = undefined;
    this.onChange(color);
  }

  setPresetColor(color: ColorPickerData, index: number): void {
    this.value = color.value;
    this.selectedColorIndex = index;
    this.onChange(color.value);
  }

  writeValue(value: string | null): void {
    this.value = value;
    this.updateUI();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
