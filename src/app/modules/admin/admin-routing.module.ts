import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConfirmDeactivateGuard, WsActivatorGuard } from '../../core/guards';
import { AdminLayoutComponent } from '../../shared/layouts/admin-layout';
import { GenresComponent } from './pages/genres/genres.component';
import { MediaComponent } from './pages/media/media.component';
import { ProducersComponent } from './pages/producers/producers.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [WsActivatorGuard],
    canDeactivate: [ConfirmDeactivateGuard, WsActivatorGuard],
    children: [
      {
        path: 'genres',
        component: GenresComponent
      },
      {
        path: 'producers',
        component: ProducersComponent,
      },
      {
        path: 'media',
        component: MediaComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
