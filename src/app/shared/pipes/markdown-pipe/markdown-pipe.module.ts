import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarkedPipe } from './marked/marked.pipe';
import { MarkedService } from './marked/marked.service';
import { HtmlPipeModule } from '../html-pipe';

@NgModule({
  declarations: [
    MarkedPipe
  ],
  imports: [
    CommonModule,
    HtmlPipeModule
  ],
  providers: [MarkedService],
  exports: [MarkedPipe]
})
export class MarkdownPipeModule { }
