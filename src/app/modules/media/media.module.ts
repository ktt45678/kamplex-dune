import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { PaginatorModule } from 'primeng/paginator';
import { TabViewModule } from 'primeng/tabview';

import { MediaRoutingModule } from './media-routing.module';
import { MediaFilterModule } from '../../shared/components/media-filter';
import { MediaListModule } from '../../shared/components/media-list';
import { MediaTopModule } from '../../shared/components/media-top';
import { EpisodeListModule } from '../../shared/components/episode-list';
import { VideoPlayerModule } from '../../shared/components/video-player';
import { StarRatingModule } from '../../shared/components/star-rating';
import { SkeletonModule as AppSkeletonModule } from '../../shared/components/skeleton';
import { AddToPlaylistModule } from '../../shared/dialogs/add-to-playlist';
import { SearchComponent } from './pages/search/search.component';
import { WatchComponent } from './pages/watch/watch.component';
import { DetailsComponent } from './pages/details/details.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { ListComponent } from './pages/list/list.component';
import { LazyloadImageExtraModule } from '../../shared/directives/lazyload-image-extra';
import { CdkMenuCustomModule } from '../../shared/directives/cdk-menu-custom';
import { UrlPipeModule } from '../../shared/pipes/url-pipe';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { DateTimePipeModule } from '../../shared/pipes/date-time-pipe';
import { TypePipeModule } from '../../shared/pipes/type-pipe';
import { AltTagModule, AltToggleButtonModule, AltTooltipModule } from '../../core/utils/primeng';

@NgModule({
  declarations: [
    WatchComponent,
    DetailsComponent,
    SearchComponent,
    PlaylistsComponent,
    ListComponent
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
    AppSkeletonModule,
    AddToPlaylistModule,
    AltTagModule,
    AltTooltipModule,
    AltToggleButtonModule,
    TranslocoModule,
    LazyLoadImageModule,
    InfiniteScrollModule,
    LazyloadImageExtraModule,
    CdkMenuCustomModule,
    NumberPipeModule,
    DateTimePipeModule,
    TypePipeModule,
    UrlPipeModule,
    ButtonModule,
    DialogModule,
    DynamicDialogModule,
    PaginatorModule,
    TabViewModule
  ],
  providers: [
    DialogService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media'
    }
  ]
})
export class MediaModule { }
