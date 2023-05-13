import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

export interface TextResizeOption {
  length: number;
  size: string;
  lineHeight: string;
  disabled?: boolean;
}

@Directive({
  selector: '[appTextResize]'
})
export class TextResizeDirective implements OnChanges {
  _originalSize: string | null = null;
  _originalLineheight: string | null = null;
  _hasChanged: boolean = false;

  @Input() resizeOptions: TextResizeOption[] = [];

  @Input() appTextResize!: string;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {
    this._originalSize = this.el.nativeElement.style.fontSize || null;
    this._originalLineheight = this.el.nativeElement.style.lineHeight || null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resizeOptions']?.currentValue || changes['appTextResize']?.currentValue) {
      this.calculateTextSize();
    }
  }

  calculateTextSize(): void {
    const stringLength = this.appTextResize.length;
    let index = -1;
    for (let i = 0; i < this.resizeOptions.length; i++) {
      if (this.resizeOptions[i].disabled) continue;
      if (stringLength > this.resizeOptions[i].length) {
        index = i;
      }
    }
    if (index > -1) {
      this.renderer.setStyle(this.el.nativeElement, 'font-size', this.resizeOptions[index].size);
      this.renderer.setStyle(this.el.nativeElement, 'line-height', this.resizeOptions[index].lineHeight);
      this._hasChanged = true;
    } else if (this._hasChanged) {
      this.renderer.setStyle(this.el.nativeElement, 'font-size', this._originalSize);
      this.renderer.setStyle(this.el.nativeElement, 'line-height', this._originalLineheight);
    }
  }
}
