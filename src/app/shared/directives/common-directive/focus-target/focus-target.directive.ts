import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[focusTarget]'
})
export class FocusTargetDirective {
  @Input() focusTarget: string | HTMLElement | null = 'none';

  constructor() { }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (!this.focusTarget === null) return;
    event.preventDefault();
    if (this.focusTarget === 'none')
      return;
    if (this.focusTarget instanceof HTMLElement && 'focus' in this.focusTarget)
      this.focusTarget.focus({ preventScroll: true });
  }

}
