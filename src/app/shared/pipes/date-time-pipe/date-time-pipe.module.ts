import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShortDatePipe } from './short-date/short-date.pipe';
import { DateAltPipe } from './date-alt/date-alt.pipe';
import { RelativeDatePipe } from './relative-date/relative-date.pipe';
import { TimePipe } from './time/time.pipe';

@NgModule({
  declarations: [
    ShortDatePipe,
    DateAltPipe,
    RelativeDatePipe,
    TimePipe
  ],
  imports: [CommonModule],
  exports: [
    ShortDatePipe,
    DateAltPipe,
    RelativeDatePipe,
    TimePipe
  ]
})
export class DateTimePipeModule { }
