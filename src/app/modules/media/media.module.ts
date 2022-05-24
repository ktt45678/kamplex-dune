import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { SwiperModule } from 'swiper/angular';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule } from 'primeng/paginator';

import { MediaRoutingModule } from './media-routing.module';
import { MediaFilterModule } from '../../shared/components/media-filter';
import { MediaListModule } from '../../shared/components/media-list';
import { MediaTopModule } from '../../shared/components/media-top';
import { VideoPlayerModule } from '../../shared/components/video-player';
import { WatchComponent } from './pages/watch/watch.component';
import { DetailsComponent } from './pages/details/details.component';
import { UrlPipeModule } from '../../shared/pipes/url-pipe/url-pipe.module';
import { MediaService } from '../../core/services';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { DateTimePipeModule } from '../../shared/pipes/date-time-pipe';
import { SearchComponent } from './pages/search/search.component';

@NgModule({
  declarations: [
    WatchComponent,
    DetailsComponent,
    SearchComponent
  ],
  imports: [
    CommonModule,
    SwiperModule,
    MediaRoutingModule,
    MediaFilterModule,
    MediaListModule,
    MediaTopModule,
    VideoPlayerModule,
    TranslocoModule,
    LazyLoadImageModule,
    NumberPipeModule,
    DateTimePipeModule,
    UrlPipeModule,
    ButtonModule,
    DialogModule,
    PaginatorModule
  ],
  providers: [
    MediaService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media'
    }
  ]
})
export class MediaModule { }
