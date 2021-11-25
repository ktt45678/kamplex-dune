import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WatchComponent } from './pages/watch/watch.component';

const routes: Routes = [
  {
    path: 'watch',
    component: WatchComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MediaRoutingModule { }
