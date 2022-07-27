import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploadComponent,
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input() styleClass: string;
  @Input() label: string;
  @Input() desciption?: string;
  @Input() accept?: string;
  @Input() showFilename: boolean = true;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedby?: string;
  @Input() disabled: boolean = false;
  @Output() fileChange = new EventEmitter<File>();

  selectedFile?: File;
  touched: boolean = false;

  onChange = (file: File) => { };
  onTouched = () => { };

  constructor(private ref: ChangeDetectorRef) {
    this.styleClass = 'tw-w-full tw-h-48';
    this.label = 'Choose File';
  }

  writeValue(value: File): void {
    this.selectedFile = value;
    this.ref.markForCheck();
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  setDisabledState(value: boolean): void {
    this.disabled = value;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  onFileInputChange(event: Event): void {
    const element = <HTMLInputElement>event.target;
    if (!element.files?.length) return;
    this.submitFile(element.files[0]);
  }

  submitFile(file: File): void {
    this.markAsTouched();
    if (this.disabled) return;
    this.selectedFile = file;
    this.onChange(this.selectedFile);
    this.fileChange.emit(this.selectedFile);
  }

  clear(): void {
    if (this.selectedFile)
      this.selectedFile = undefined;
  }

}
