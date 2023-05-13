import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';

import { HomeHeaderComponent } from './home-header.component';
import { SkeletonModule } from '../skeleton';
import { AvatarModule } from '../avatar';
import { CdkMenuCustomModule } from '../../directives/cdk-menu-custom';
import { CommonDirectiveModule } from '../../directives/common-directive';
import { LazyloadImageExtraModule } from '../../directives/lazyload-image-extra';
import { PermissionPipeModule } from '../../pipes/permission-pipe';
import { NumberPipeModule } from '../../pipes/number-pipe';
import { DateTimePipeModule } from '../../pipes/date-time-pipe';
import { StringPipeModule } from '../../pipes/string-pipe';

@NgModule({
  declarations: [HomeHeaderComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslocoModule,
    LazyLoadImageModule,
    InfiniteScrollModule,
    SkeletonModule,
    AvatarModule,
    CdkMenuCustomModule,
    CommonDirectiveModule,
    LazyloadImageExtraModule,
    PermissionPipeModule,
    NumberPipeModule,
    DateTimePipeModule,
    StringPipeModule,
    AutoCompleteModule,
    ButtonModule,
    SidebarModule
  ],
  exports: [HomeHeaderComponent]
})
export class HomeHeaderModule { }
