import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StarRatingComponent } from './star-rating.component';
import { CommonDirectiveModule } from '../../directives/common-directive';

@NgModule({
  declarations: [StarRatingComponent],
  imports: [
    CommonModule,
    CommonDirectiveModule
  ],
  exports: [StarRatingComponent]
})
export class StarRatingModule { }
