import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AvatarComponent } from './avatar.component';
import { StringPipeModule } from '../../pipes/string-pipe';

@NgModule({
  declarations: [AvatarComponent],
  imports: [
    CommonModule,
    StringPipeModule
  ],
  exports: [AvatarComponent]
})
export class AvatarModule { }
