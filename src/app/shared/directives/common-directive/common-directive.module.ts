import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgLetDirective } from './ng-let/ng-let.directive';
import { NgForRepeatDirective } from './ng-for-repeat/ng-for-repeat.directive';
import { FocusTargetDirective } from './focus-target/focus-target.directive';

@NgModule({
  declarations: [
    NgLetDirective,
    NgForRepeatDirective,
    FocusTargetDirective
  ],
  imports: [CommonModule],
  exports: [
    NgLetDirective,
    NgForRepeatDirective,
    FocusTargetDirective
  ]
})
export class CommonDirectiveModule { }
