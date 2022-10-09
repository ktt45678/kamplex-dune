import { AfterContentInit, AfterViewInit, Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { LazyLoadImageDirective } from 'ng-lazyload-image';
import { takeUntil } from 'rxjs';

import { DestroyService } from '../../../../core/services';

@Directive({
  selector: '[lazyLoad][lazyLoadPlaceholder]',
  providers: [DestroyService]
})
export class LazyLoadPlaceholderDirective implements AfterViewInit, AfterContentInit {
  @Input() lazyLoadPlaceholder: string = '#FFFFFF';
  @Input() placeholderStyleClass: string = '';
  placeholderEl?: HTMLDivElement;

  constructor(private el: ElementRef, private renderer: Renderer2, private lazyLoadImage: LazyLoadImageDirective,
    private destroyService: DestroyService) { }

  ngAfterViewInit(): void {
    // Create placeholder element, which is a single color div
    this.placeholderEl = this.renderer.createElement('div');
    this.renderer.setAttribute(this.placeholderEl, 'class', this.placeholderStyleClass);
    this.renderer.addClass(this.placeholderEl, 'tw-w-full');
    this.renderer.addClass(this.placeholderEl, 'tw-h-full');
    this.renderer.setStyle(this.placeholderEl, 'background-color', this.lazyLoadPlaceholder);
    // Insert after the image element
    this.renderer.insertBefore(this.renderer.parentNode(this.el.nativeElement), this.placeholderEl,
      this.renderer.nextSibling(this.el.nativeElement));
  }

  ngAfterContentInit(): void {
    // EventEmitter#subscribe maybe deprecated in the future
    const lazyLoadSubscription = this.lazyLoadImage.onStateChange.pipe(takeUntil(this.destroyService)).subscribe(event => {
      if (event.reason === 'finally') {
        // Remove the placeholder element when the image finishes loading
        this.placeholderEl?.remove();
        this.placeholderEl = undefined;
        lazyLoadSubscription?.unsubscribe();
      }
    });
  }
}
