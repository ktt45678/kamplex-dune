import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeLayoutComponent } from '../../shared/layouts/home-layout';
import { DetailsComponent } from './pages/details/details.component';
import { WatchComponent } from './pages/watch/watch.component';

const routes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      {
        path: 'details/:id',
        component: DetailsComponent
      },
      {
        path: 'watch/:id',
        component: WatchComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MediaRoutingModule { }
