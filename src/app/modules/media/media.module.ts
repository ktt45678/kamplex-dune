import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule } from 'primeng/paginator';

import { MediaRoutingModule } from './media-routing.module';
import { MediaFilterModule } from '../../shared/components/media-filter';
import { MediaListModule } from '../../shared/components/media-list';
import { MediaTopModule } from '../../shared/components/media-top';
import { WatchComponent } from './pages/watch/watch.component';
import { DetailsComponent } from './pages/details/details.component';
import { UrlPipeModule } from '../../shared/pipes/url-pipe/url-pipe.module';
import { MediaService } from '../../core/services';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { DatePipeModule } from '../../shared/pipes/date-pipe';
import { SearchComponent } from './pages/search/search.component';

@NgModule({
  declarations: [
    WatchComponent,
    DetailsComponent,
    SearchComponent
  ],
  imports: [
    CommonModule,
    MediaRoutingModule,
    MediaFilterModule,
    MediaListModule,
    MediaTopModule,
    TranslocoModule,
    LazyLoadImageModule,
    NumberPipeModule,
    DatePipeModule,
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
