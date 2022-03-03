import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgLetDirective } from './ng-let/ng-let.directive';
import { NgForRepeatDirective } from './ng-for-repeat/ng-for-repeat.directive';

@NgModule({
  declarations: [NgLetDirective, NgForRepeatDirective],
  imports: [CommonModule],
  exports: [
    NgLetDirective,
    NgForRepeatDirective
  ]
})
export class CommonDirectiveModule { }
