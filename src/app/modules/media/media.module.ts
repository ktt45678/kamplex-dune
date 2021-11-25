import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MediaRoutingModule } from './media-routing.module';
import { WatchComponent } from './pages/watch/watch.component';

@NgModule({
  declarations: [
    WatchComponent
  ],
  imports: [
    CommonModule,
    MediaRoutingModule
  ]
})
export class MediaModule { }
