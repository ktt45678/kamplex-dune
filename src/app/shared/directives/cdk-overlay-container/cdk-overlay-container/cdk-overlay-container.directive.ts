import { Directive, ElementRef, Inject, Renderer2 } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

import { CustomOverlayContainer } from '../custom-overlay-container';

@Directive({
  selector: '[appCdkOverlayContainer]'
})
export class CdkOverlayContainerDirective {
  constructor(private renderer: Renderer2, private elementRef: ElementRef,
    @Inject(OverlayContainer) private customOverlayContainer: CustomOverlayContainer) {
    this.renderer.addClass(this.elementRef.nativeElement, 'cdk-overlay-container');
    this.customOverlayContainer.setContainerElement(this.elementRef.nativeElement);
  }
}
