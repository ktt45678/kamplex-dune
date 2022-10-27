import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkStepperModule } from '@angular/cdk/stepper';

import { StepperComponent } from './stepper.component';

@NgModule({
  declarations: [StepperComponent],
  imports: [
    CommonModule,
    CdkStepperModule
  ],
  exports: [
    StepperComponent,
    CdkStepperModule
  ]
})
export class StepperModule { }
