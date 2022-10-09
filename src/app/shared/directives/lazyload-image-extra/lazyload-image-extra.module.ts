import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LazyLoadPlaceholderDirective } from './lazyload-placeholder/lazyload-placeholder.directive';

@NgModule({
  declarations: [LazyLoadPlaceholderDirective],
  imports: [CommonModule],
  exports: [LazyLoadPlaceholderDirective]
})
export class LazyloadImageExtraModule { }
