import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressBarModule } from 'primeng/progressbar';

import { UsersRoutingModule } from './users-routing.module';
import { ProfileComponent } from './pages/profile/profile.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { HistoryComponent } from './pages/history/history.component';
import { UsersLayoutModule } from '../../shared/layouts/users-layout';
import { CommonDirectiveModule } from '../../shared/directives/common-directive';
import { LazyloadImageExtraModule } from '../../shared/directives/lazyload-image-extra';
import { DateTimePipeModule } from '../../shared/pipes/date-time-pipe';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { UsersService } from '../../core/services';


@NgModule({
  declarations: [
    ProfileComponent,
    PlaylistsComponent,
    HistoryComponent
  ],
  imports: [
    CommonModule,
    TranslocoModule,
    UsersRoutingModule,
    UsersLayoutModule,
    NumberPipeModule,
    DateTimePipeModule,
    CommonDirectiveModule,
    LazyLoadImageModule,
    LazyloadImageExtraModule,
    ButtonModule,
    SkeletonModule,
    ProgressBarModule
  ],
  providers: [
    UsersService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: ['users', 'media']
    }
  ]
})
export class UsersModule { }
