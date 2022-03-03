import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HasPermissionPipe } from './has-permission/has-permission.pipe';
import { PermissionPipeService } from './permission-pipe.service';

@NgModule({
  declarations: [HasPermissionPipe],
  imports: [CommonModule],
  providers: [PermissionPipeService],
  exports: [HasPermissionPipe]
})
export class PermissionPipeModule { }
