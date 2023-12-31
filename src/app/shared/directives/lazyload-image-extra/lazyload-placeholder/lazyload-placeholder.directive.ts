import { AfterContentInit, AfterViewInit, Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { LazyLoadImageDirective } from 'ng-lazyload-image';
import { takeUntil } from 'rxjs';

import { DestroyService } from '../../../../core/services';
import { thumbHashToDataURL } from '../../../../core/utils';

@Directive({
  selector: '[lazyLoad][lazyLoadPlaceholder]',
  providers: [DestroyService],
  host: {
    'class': 'ng-lazyload-extended-placeholder'
  }
})
export class LazyLoadPlaceholderDirective implements AfterViewInit, AfterContentInit {
  @Input() lazyLoadPlaceholder: string = '#FFFFFF';
  @Input() placeholderType: 'color' | 'thumbhash' = 'color';
  @Input() placeholderStyleClass: string = '';
  placeholderEl?: HTMLDivElement | HTMLImageElement;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2, private lazyLoadImage: LazyLoadImageDirective,
    private destroyService: DestroyService) { }

  ngAfterViewInit(): void {
    if (this.placeholderType === 'color') {
      // Create placeholder element, which is a single color div
      this.placeholderEl = this.renderer.createElement('div');
      this.renderer.setAttribute(this.placeholderEl, 'class', this.placeholderStyleClass);
      this.renderer.addClass(this.placeholderEl, 'tw-w-full');
      this.renderer.addClass(this.placeholderEl, 'tw-h-full');
      this.renderer.setStyle(this.placeholderEl, 'background-color', this.lazyLoadPlaceholder);
    } else {
      // Create placeholder element using thumbhash
      const dataURL = thumbHashToDataURL(Uint8Array.from(window.atob(this.lazyLoadPlaceholder), c => c.charCodeAt(0)));
      this.placeholderEl = this.renderer.createElement('img');
      this.renderer.setAttribute(this.placeholderEl, 'class', this.placeholderStyleClass);
      this.renderer.addClass(this.placeholderEl, 'tw-w-full');
      this.renderer.addClass(this.placeholderEl, 'tw-h-full');
      this.renderer.setProperty(this.placeholderEl, 'src', dataURL);
    }
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
