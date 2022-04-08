import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CircularProgressComponent } from './circular-progress.component';

@NgModule({
  declarations: [CircularProgressComponent],
  imports: [
    CommonModule
  ],
  exports: [CircularProgressComponent]
})
export class CircularProgressModule { }
