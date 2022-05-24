import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShortDatePipe } from './short-date/short-date.pipe';
import { TimePipe } from './time/time.pipe';

@NgModule({
  declarations: [
    ShortDatePipe,
    TimePipe
  ],
  imports: [CommonModule],
  exports: [
    ShortDatePipe,
    TimePipe
  ]
})
export class DateTimePipeModule { }
