import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';

import { AppOverlayOrigin, AppConnectedOverlay, APP_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER } from './overlay-panel/overlay-panel.directive';

@NgModule({
  declarations: [
    AppOverlayOrigin,
    AppConnectedOverlay
  ],
  imports: [
    CommonModule,
    OverlayModule
  ],
  providers: [APP_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER],
  exports: [
    AppOverlayOrigin,
    AppConnectedOverlay
  ]
})
export class OverlayPanelModule { }
