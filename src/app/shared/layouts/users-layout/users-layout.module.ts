import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { TabMenuModule } from 'primeng/tabmenu';

import { UsersLayoutComponent } from './users-layout.component';
import { LazyloadImageExtraModule } from '../../directives/lazyload-image-extra';
import { NumberPipeModule } from '../../pipes/number-pipe';
import { CdkMenuCustomModule } from '../../directives/cdk-menu-custom';

@NgModule({
  declarations: [UsersLayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslocoModule,
    LazyLoadImageModule,
    LazyloadImageExtraModule,
    NumberPipeModule,
    CdkMenuCustomModule,
    TabMenuModule
  ],
  exports: [UsersLayoutComponent]
})
export class UsersLayoutModule { }
