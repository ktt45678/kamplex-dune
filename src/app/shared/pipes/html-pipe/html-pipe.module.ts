import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DompurifyPipe } from './dompurify/dompurify.pipe';
import { DompurifyService } from './dompurify/dompurify.service';

@NgModule({
  declarations: [
    DompurifyPipe
  ],
  imports: [CommonModule],
  providers: [DompurifyService],
  exports: [DompurifyPipe]
})
export class HtmlPipeModule { }
