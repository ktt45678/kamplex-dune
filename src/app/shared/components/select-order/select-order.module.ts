import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

import { SelectOrderComponent } from './select-order.component';

@NgModule({
  declarations: [SelectOrderComponent],
  imports: [
    CommonModule,
    DragDropModule,
    ButtonModule,
    DropdownModule
  ],
  exports: [SelectOrderComponent]
})
export class SelectOrderModule { }
