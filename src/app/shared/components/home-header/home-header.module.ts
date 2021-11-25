import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';

import { HomeHeaderComponent } from './home-header.component';

@NgModule({
  declarations: [HomeHeaderComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslocoModule,
    ButtonModule
  ],
  exports: [HomeHeaderComponent]
})
export class HomeHeaderModule { }
