import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GenresComponent } from './pages/genres/genres.component';
import { MediaComponent } from './pages/media/media.component';
import { ProducersComponent } from './pages/producers/producers.component';

const routes: Routes = [
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
