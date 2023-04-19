import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CdkOverlayContainerDirective } from './cdk-overlay-container/cdk-overlay-container.directive';

@NgModule({
  declarations: [CdkOverlayContainerDirective],
  imports: [CommonModule],
  exports: [CdkOverlayContainerDirective]
})
export class CdkOverlayContainerModule { }
