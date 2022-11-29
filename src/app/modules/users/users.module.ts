import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';

import { UsersRoutingModule } from './users-routing.module';
import { ProfileComponent } from './pages/profile/profile.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { UsersLayoutModule } from '../../shared/layouts/users-layout';
import { UsersService } from '../../core/services';

@NgModule({
  declarations: [
    ProfileComponent,
    PlaylistsComponent
  ],
  imports: [
    CommonModule,
    TranslocoModule,
    UsersRoutingModule,
    UsersLayoutModule
  ],
  providers: [
    UsersService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'users'
    }
  ]
})
export class UsersModule { }
