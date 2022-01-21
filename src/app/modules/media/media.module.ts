import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { MediaRoutingModule } from './media-routing.module';
import { HomeLayoutModule } from '../../shared/layouts/home-layout';
import { WatchComponent } from './pages/watch/watch.component';
import { DetailsComponent } from './pages/details/details.component';
import { MediaService } from '../../core/services';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { DatePipeModule } from '../../shared/pipes/date-pipe';
import { UrlPipeModule } from '../../shared/pipes/url-pipe/url-pipe.module';

@NgModule({
  declarations: [
    WatchComponent,
    DetailsComponent
  ],
  imports: [
    CommonModule,
    MediaRoutingModule,
    HomeLayoutModule,
    TranslocoModule,
    LazyLoadImageModule,
    NumberPipeModule,
    DatePipeModule,
    UrlPipeModule,
    ButtonModule,
    DialogModule
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
