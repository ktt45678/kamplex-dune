import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { ProfileComponent } from './pages/profile/profile.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { UsersLayoutModule } from '../../shared/layouts/users-layout';

@NgModule({
  declarations: [
    ProfileComponent,
    PlaylistsComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    UsersLayoutModule
  ]
})
export class UsersModule { }
