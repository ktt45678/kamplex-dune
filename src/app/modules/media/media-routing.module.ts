import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchComponent } from './pages/search/search.component';
import { DetailsComponent } from './pages/details/details.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { WatchComponent } from './pages/watch/watch.component';
import { ListComponent } from './pages/list/list.component';

const routes: Routes = [
  {
    path: 'search',
    component: SearchComponent,
    data: {
      title: 'search'
    }
  },
  {
    path: 'list/:path',
    component: ListComponent,
    data: {
      disableTitleStrategy: true
    }
  },
  {
    path: 'list/:path/:sub_path',
    component: ListComponent,
    data: {
      disableTitleStrategy: true
    }
  },
  {
    path: 'details/:id',
    component: DetailsComponent,
    data: {
      disableTitleStrategy: true,
      fixedNavbarSpacing: false
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
