import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThumbhashUrlPipe } from './thumbhash-url/thumbhash-url.pipe';

@NgModule({
  declarations: [ThumbhashUrlPipe],
  imports: [
    CommonModule
  ],
  exports: [
    ThumbhashUrlPipe
  ]
})
export class PlaceholderPipeModule { }
