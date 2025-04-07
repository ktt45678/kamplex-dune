import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgLetDirective } from './ng-let/ng-let.directive';
import { NgForRepeatDirective } from './ng-for-repeat/ng-for-repeat.directive';
import { FocusTargetDirective } from './focus-target/focus-target.directive';
import { TemplateForDirective } from './template-for/template-for.directive';

@NgModule({
  declarations: [
    NgLetDirective,
    NgForRepeatDirective,
    FocusTargetDirective,
    TemplateForDirective
  ],
  imports: [CommonModule],
  exports: [
    NgLetDirective,
    NgForRepeatDirective,
    FocusTargetDirective,
    TemplateForDirective
  ]
})
export class CommonDirectiveModule { }
