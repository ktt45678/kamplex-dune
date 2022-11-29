import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SwiperModule } from 'swiper/angular';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

import { HomeRoutingModule } from './home-routing.module';
import { LazyloadImageExtraModule } from '../../shared/directives/lazyload-image-extra';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { DateTimePipeModule } from '../../shared/pipes/date-time-pipe';
import { HomeComponent } from './pages/home/home.component';
import { MediaListModule } from '../../shared/components/media-list';
import { MediaTopModule } from '../../shared/components/media-top';
import { FeaturedMediaComponent } from './components/featured-media';

@NgModule({
  declarations: [
    HomeComponent,
    FeaturedMediaComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    NumberPipeModule,
    DateTimePipeModule,
    TranslocoModule,
    LazyLoadImageModule,
    SwiperModule,
    LazyloadImageExtraModule,
    MediaListModule,
    MediaTopModule,
    ButtonModule,
    BadgeModule,
    SkeletonModule
  ],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: ['home', 'media']
    }
  ]
})
export class HomeModule { }
