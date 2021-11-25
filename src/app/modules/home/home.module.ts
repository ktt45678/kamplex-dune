import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SwiperModule } from 'swiper/angular';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { HomeLayoutModule } from '../../shared/layouts/home-layout';
import { MediaListModule } from '../../shared/components/media-list';
import { MediaTopModule } from '../../shared/components/media-top';
import { FeaturedMediaComponent } from './components/featured-media';
import { MediaFilterModule } from '../../shared/components/media-filter';

@NgModule({
  declarations: [
    HomeComponent,
    FeaturedMediaComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    TranslocoModule,
    LazyLoadImageModule,
    SwiperModule,
    HomeLayoutModule,
    MediaListModule,
    MediaTopModule,
    MediaFilterModule,
    ButtonModule,
    BadgeModule
  ],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'home'
    }
  ]
})
export class HomeModule { }
