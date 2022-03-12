import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[dragDropFile]'
})
export class DragDropFileDirective {
  @Input() disabled: boolean = false;
  @Output() fileDropped = new EventEmitter<any>();

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.addClass(this.el.nativeElement, 'tw-upload-file');
  }

  // Dragover Event
  @HostListener('dragover', ['$event']) dragOver(event: any) {
    if (this.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    this.renderer.removeClass(this.el.nativeElement, 'tw-upload-file');
    this.renderer.addClass(this.el.nativeElement, 'tw-upload-file-over');
  }

  // Dragleave Event
  @HostListener('dragleave', ['$event']) public dragLeave(event: any) {
    if (this.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    this.renderer.removeClass(this.el.nativeElement, 'tw-upload-file-over');
    this.renderer.addClass(this.el.nativeElement, 'tw-upload-file');
  }

  // Drop Event
  @HostListener('drop', ['$event']) public drop(event: any) {
    if (this.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    this.renderer.removeClass(this.el.nativeElement, 'tw-upload-file-over');
    this.renderer.addClass(this.el.nativeElement, 'tw-upload-file');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.fileDropped.emit(files[0]);
    }
  }

}
