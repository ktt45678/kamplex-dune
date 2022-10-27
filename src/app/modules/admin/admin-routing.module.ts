import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard, ConfirmDeactivateGuard, WsActivatorGuard } from '../../core/guards';
import { AdminLayoutComponent } from '../../shared/layouts/admin-layout';
import { GenresComponent } from './pages/genres/genres.component';
import { MediaComponent } from './pages/media/media.component';
import { ProductionsComponent } from './pages/productions/productions.component';
import { UserPermission } from '../../core/enums';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, WsActivatorGuard],
    canDeactivate: [ConfirmDeactivateGuard, WsActivatorGuard],
    data: {
      withPermissions: [UserPermission.MANAGE_MEDIA]
    },
    children: [
      {
        path: 'genres',
        component: GenresComponent
      },
      {
        path: 'productions',
        component: ProductionsComponent,
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
