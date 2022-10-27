import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsersLayoutComponent } from '../../shared/layouts/users-layout';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: UsersLayoutComponent,
    children: [
      {
        path: ':id/profile',
        component: ProfileComponent
      },
      {
        path: ':id/playlists',
        component: PlaylistsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
