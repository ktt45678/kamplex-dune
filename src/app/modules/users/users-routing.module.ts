import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsersLayoutComponent } from '../../shared/layouts/users-layout';
import { HistoryComponent } from './pages/history/history.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  {
    path: ':id',
    component: UsersLayoutComponent,
    children: [
      {
        path: '',
        component: ProfileComponent,
        pathMatch: 'full'
      },
      {
        path: 'history',
        component: HistoryComponent
      },
      {
        path: 'rated',
        component: PlaylistsComponent
      },
      {
        path: 'playlists',
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
