import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, HostListener, Inject, Input, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[dragDropFile]',
  exportAs: 'dragDropFile'
})
export class DragDropFileDirective {
  @Input() disabled: boolean = false;
  @Input() documentListener: boolean = true;
  @Output() dragChange = new EventEmitter<boolean>();
  @Output() dragDocumentChange = new EventEmitter<boolean>();
  @Output() fileDropped = new EventEmitter<any>();
  isOverDocument: boolean = false;
  isOverElement: boolean = false;

  constructor(@Inject(DOCUMENT) private document: Document, private el: ElementRef) { }

  // Dragenter Document Event
  @HostListener('document:dragenter', ['$event']) dragEnterDocument(event: any) {
    if (this.disabled || !this.documentListener) return;
    event.preventDefault();
    event.stopPropagation();
    if (!this.isOverDocument) {
      this.isOverDocument = true;
      this.dragDocumentChange.emit(true);
    }
  }

  // Dragover Document Event
  @HostListener('document:dragover', ['$event']) dragOverDocument(event: any) {
    if (this.disabled || !this.documentListener) return;
    event.preventDefault();
    event.stopPropagation();
  }

  // Dragleave Document Event
  @HostListener('document:dragleave', ['$event']) dragLeaveDocument(event: any) {
    if (this.disabled || !this.documentListener) return;
    event.preventDefault();
    event.stopPropagation();
    // Check if the related target is a child of the document.body element
    if (event.relatedTarget && (!event.relatedTarget.parentElement || this.document.contains(event.relatedTarget)) && !this.isOverElement)
      return;
    if (this.isOverDocument) {
      this.isOverDocument = false;
      this.dragDocumentChange.emit(false);
    }
  }

  // Drop Event
  @HostListener('document:drop', ['$event']) dropDocument(event: any) {
    if (this.disabled || !this.documentListener) return;
    event.preventDefault();
    event.stopPropagation();
    this.isOverDocument = false;
    this.dragDocumentChange.emit(false);
  }

  // Dragenter Event
  @HostListener('dragenter', ['$event']) dragEnter(event: any) {
    if (this.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    if (!this.isOverElement) {
      this.isOverElement = true;
      this.dragChange.emit(true);
    }
  }

  // Dragover Event
  @HostListener('dragover', ['$event']) dragOver(event: any) {
    if (this.disabled) return;
    event.preventDefault();
    event.stopPropagation();
  }

  // Dragleave Event
  @HostListener('dragleave', ['$event']) dragLeave(event: any) {
    if (this.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.relatedTarget && (!event.relatedTarget.parentElement || this.el.nativeElement.contains(event.relatedTarget)))
      return;
    if (this.isOverElement) {
      this.isOverElement = false;
      this.dragChange.emit(false);
    }
  }

  // Drop Event
  @HostListener('drop', ['$event']) drop(event: any) {
    if (this.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    this.isOverDocument = false;
    this.isOverElement = false;
    this.dragDocumentChange.emit(false);
    this.dragChange.emit(false);
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.fileDropped.emit(files[0]);
    }
  }

}
