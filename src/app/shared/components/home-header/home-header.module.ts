import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';

import { HomeHeaderComponent } from './home-header.component';
import { SkeletonModule } from '../skeleton';
import { AvatarModule } from '../avatar';
import { SearchOverlayModule } from '../../dialogs/search-overlay';
import { CdkMenuCustomModule } from '../../directives/cdk-menu-custom';
import { CommonDirectiveModule } from '../../directives/common-directive';
import { PermissionPipeModule } from '../../pipes/permission-pipe';
import { NumberPipeModule } from '../../pipes/number-pipe';
import { DateTimePipeModule } from '../../pipes/date-time-pipe';
import { StringPipeModule } from '../../pipes/string-pipe';
import { PlaceholderPipeModule } from '../../pipes/placeholder-pipe';

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
    SearchOverlayModule,
    CdkMenuCustomModule,
    CommonDirectiveModule,
    PermissionPipeModule,
    NumberPipeModule,
    DateTimePipeModule,
    StringPipeModule,
    PlaceholderPipeModule,
    AutoCompleteModule,
    DynamicDialogModule,
    ButtonModule,
    SidebarModule
  ],
  providers: [DialogService],
  exports: [HomeHeaderComponent]
})
export class HomeHeaderModule { }
