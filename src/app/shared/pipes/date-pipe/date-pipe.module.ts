import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShortDatePipe } from './short-date/short-date.pipe';

@NgModule({
  declarations: [ShortDatePipe],
  imports: [CommonModule],
  exports: [ShortDatePipe]
})
export class DatePipeModule { }
