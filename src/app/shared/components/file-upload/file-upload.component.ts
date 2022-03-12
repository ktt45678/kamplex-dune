import { Component, OnInit, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent implements OnInit {
  @Input() styleClass: string;
  @Input() label: string;
  @Input() accept?: string;
  @Input() disabled: boolean = false;
  @Output() onFileChange: EventEmitter<File>;

  selectedFileName?: string;

  constructor() {
    this.styleClass = 'tw-w-full tw-h-48';
    this.label = 'Choose File';
    this.onFileChange = new EventEmitter<File>();
  }

  ngOnInit(): void {
  }

  onFileInputChange(event: Event): void {
    const element = <HTMLInputElement>event.target;
    if (!element.files?.length) return;
    this.submitFile(element.files[0]);
  }

  submitFile(file: File): void {
    this.selectedFileName = file.name;
    this.onFileChange.emit(file);
  }

}
