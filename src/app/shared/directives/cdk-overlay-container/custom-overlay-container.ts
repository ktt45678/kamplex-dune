import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable()
export class CustomOverlayContainer extends OverlayContainer {
  /**
   * Set the container element from the outside, e.g. from the corresponding directive
   */
  public setContainerElement(element: HTMLElement): void {
    this._containerElement = element;
  }

  /**
   * Prevent creation of the HTML element
   */
  protected override _createContainer(): void {
    return;
  }
}
