import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HasPermissionPipe } from './has-permission/has-permission.pipe';
import { PermissionPipeService } from './permission-pipe.service';
import { IsGrantedPipe } from './is-granted/is-granted.pipe';

@NgModule({
  declarations: [
    HasPermissionPipe,
    IsGrantedPipe
  ],
  imports: [CommonModule],
  providers: [PermissionPipeService],
  exports: [
    HasPermissionPipe,
    IsGrantedPipe
  ]
})
export class PermissionPipeModule { }
