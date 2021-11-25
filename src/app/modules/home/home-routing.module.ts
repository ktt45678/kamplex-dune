import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeLayoutComponent } from '../../shared/layouts/home-layout';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
