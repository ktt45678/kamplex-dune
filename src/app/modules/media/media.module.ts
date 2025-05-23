import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';

import { MediaRoutingModule } from './media-routing.module';
import { MediaFilterModule } from '../../shared/components/media-filter';
import { MediaListModule } from '../../shared/components/media-list';
import { MediaTopModule } from '../../shared/components/media-top';
import { EpisodeListModule } from '../../shared/components/episode-list';
import { VideoPlayerModule } from '../../shared/components/video-player';
import { StarRatingModule } from '../../shared/components/star-rating';
import { SkeletonModule } from '../../shared/components/skeleton';
import { ExpansionPanelComponent } from '../../shared/components/expansion-panel';
import { AddToPlaylistModule } from '../../shared/dialogs/add-to-playlist';
import { ShareMediaLinkModule } from '../../shared/dialogs/share-media-link';
import { SearchComponent } from './pages/search/search.component';
import { WatchComponent } from './pages/watch/watch.component';
import { DetailsComponent } from './pages/details/details.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { ListComponent } from './pages/list/list.component';
import { CollectionListComponent } from './components/collection-list/collection-list.component';
import { CollectionMediaListComponent } from './components/collection-media-list/collection-media-list.component';
import { CdkMenuCustomModule } from '../../shared/directives/cdk-menu-custom';
import { CommonDirectiveModule } from '../../shared/directives/common-directive';
import { OverlayPanelModule } from '../../shared/directives/overlay-panel';
import { TextDirectiveModule } from '../../shared/directives/text-directive';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { DateTimePipeModule } from '../../shared/pipes/date-time-pipe';
import { TypePipeModule } from '../../shared/pipes/type-pipe';
import { UrlPipeModule } from '../../shared/pipes/url-pipe';
import { PlaceholderPipeModule } from '../../shared/pipes/placeholder-pipe';

@NgModule({
  declarations: [
    WatchComponent,
    DetailsComponent,
    SearchComponent,
    PlaylistsComponent,
    ListComponent,
    CollectionListComponent,
    CollectionMediaListComponent
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
    SkeletonModule,
    ExpansionPanelComponent,
    AddToPlaylistModule,
    ShareMediaLinkModule,
    TranslocoModule,
    LazyLoadImageModule,
    InfiniteScrollModule,
    CdkMenuCustomModule,
    CommonDirectiveModule,
    OverlayPanelModule,
    TextDirectiveModule,
    NumberPipeModule,
    DateTimePipeModule,
    TypePipeModule,
    UrlPipeModule,
    PlaceholderPipeModule,
    ButtonModule,
    DialogModule,
    DynamicDialogModule,
    ToggleButtonModule,
    PaginatorModule,
    TooltipModule,
    TabViewModule,
    TagModule
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
