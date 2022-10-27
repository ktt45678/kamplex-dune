import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UsersLayoutComponent } from './users-layout.component';

@NgModule({
  declarations: [
    UsersLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    UsersLayoutComponent
  ]
})
export class UsersLayoutModule { }
