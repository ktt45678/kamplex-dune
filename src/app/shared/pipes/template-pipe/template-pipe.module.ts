import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QueryListGetPipe } from './query-list-get/query-list-get.pipe';
import { QueryListFindPipe } from './query-list-find/query-list-find.pipe';

@NgModule({
  declarations: [
    QueryListGetPipe,
    QueryListFindPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    QueryListGetPipe,
    QueryListFindPipe
  ]
})
export class TemplatePipeModule { }
