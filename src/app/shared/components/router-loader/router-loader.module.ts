import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterLoaderComponent } from './router-loader.component';
import { RouterLoaderService } from './router-loader.service';

@NgModule({
  declarations: [RouterLoaderComponent],
  imports: [CommonModule],
  providers: [RouterLoaderService],
  exports: [RouterLoaderComponent]
})
export class RouterLoaderModule { }
