import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchComponent } from './pages/search/search.component';
import { DetailsComponent } from './pages/details/details.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { WatchComponent } from './pages/watch/watch.component';

const routes: Routes = [
  {
    path: 'search',
    component: SearchComponent,
    data: {
      title: 'search'
    }
  },
  {
    path: 'details/:id',
    component: DetailsComponent,
    data: {
      disableTitleStrategy: true
    }
  },
  {
    path: 'playlists/:id',
    component: PlaylistsComponent,
    data: {
      disableTitleStrategy: true
    }
  },
  {
    path: 'watch/:id',
    component: WatchComponent,
    data: {
      disableTitleStrategy: true
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MediaRoutingModule { }
