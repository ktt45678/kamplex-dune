import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule } from 'primeng/paginator';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

import { MediaRoutingModule } from './media-routing.module';
import { MediaFilterModule } from '../../shared/components/media-filter';
import { MediaListModule } from '../../shared/components/media-list';
import { MediaTopModule } from '../../shared/components/media-top';
import { EpisodeListModule } from '../../shared/components/episode-list';
import { VideoPlayerModule } from '../../shared/components/video-player';
import { StarRatingModule } from '../../shared/components/star-rating';
import { SearchComponent } from './pages/search/search.component';
import { WatchComponent } from './pages/watch/watch.component';
import { DetailsComponent } from './pages/details/details.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { LazyloadImageExtraModule } from '../../shared/directives/lazyload-image-extra';
import { UrlPipeModule } from '../../shared/pipes/url-pipe';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { DateTimePipeModule } from '../../shared/pipes/date-time-pipe';

@NgModule({
  declarations: [
    WatchComponent,
    DetailsComponent,
    SearchComponent,
    PlaylistsComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    MediaRoutingModule,
    MediaFilterModule,
    MediaListModule,
    MediaTopModule,
    EpisodeListModule,
    VideoPlayerModule,
    StarRatingModule,
    TranslocoModule,
    LazyLoadImageModule,
    LazyloadImageExtraModule,
    NumberPipeModule,
    DateTimePipeModule,
    UrlPipeModule,
    ButtonModule,
    ToggleButtonModule,
    DialogModule,
    PaginatorModule,
    TabViewModule,
    TooltipModule,
    SkeletonModule,
    TagModule
  ],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media'
    }
  ]
})
export class MediaModule { }
