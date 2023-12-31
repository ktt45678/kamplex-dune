import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SwiperModule } from 'swiper/angular';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';

import { HomeRoutingModule } from './home-routing.module';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { DateTimePipeModule } from '../../shared/pipes/date-time-pipe';
import { PlaceholderPipeModule } from '../../shared/pipes/placeholder-pipe';
import { HomeComponent } from './pages/home/home.component';
import { MediaListModule } from '../../shared/components/media-list';
import { MediaTopModule } from '../../shared/components/media-top';
import { SkeletonModule } from '../../shared/components/skeleton';
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
    PlaceholderPipeModule,
    TranslocoModule,
    LazyLoadImageModule,
    SwiperModule,
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
