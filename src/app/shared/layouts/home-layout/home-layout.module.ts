import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HomeLayoutComponent } from './home-layout.component';
import { HomeHeaderModule } from '../../components/home-header';
import { HomeFooterModule } from '../../components/home-footer';

@NgModule({
  declarations: [HomeLayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    HomeHeaderModule,
    HomeFooterModule
  ],
  exports: [HomeLayoutComponent]
})
export class HomeLayoutModule { }
