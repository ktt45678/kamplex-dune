import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TableModule } from 'primeng/table';

import { UsersRoutingModule } from './users-routing.module';
import { ProfileComponent } from './pages/profile/profile.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { HistoryComponent } from './pages/history/history.component';
import { CreatePlaylistComponent } from './dialogs/create-playlist/create-playlist.component';
import { UsersLayoutModule } from '../../shared/layouts/users-layout';
import { AddToPlaylistModule } from '../../shared/dialogs/add-to-playlist';
import { AddAllToPlaylistModule } from '../../shared/dialogs/add-all-to-playlist';
import { CommonDirectiveModule } from '../../shared/directives/common-directive';
import { LazyloadImageExtraModule } from '../../shared/directives/lazyload-image-extra';
import { FormDirectiveModule } from '../../shared/directives/form-directive';
import { CdkMenuCustomModule } from '../../shared/directives/cdk-menu-custom';
import { DateTimePipeModule } from '../../shared/pipes/date-time-pipe';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { ValidationPipeModule } from '../../shared/pipes/validation-pipe';
import { UsersService } from '../../core/services';
import { RatedComponent } from './pages/rated/rated.component';
import { StarRatingModule } from '../../shared/components/star-rating';
import { SkeletonModule } from '../../shared/components/skeleton';
import { AltSelectButtonModule, AltToggleButtonModule, AltTooltipModule } from '../../core/utils/primeng';

@NgModule({
  declarations: [
    ProfileComponent,
    PlaylistsComponent,
    HistoryComponent,
    RatedComponent,
    CreatePlaylistComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    UsersRoutingModule,
    UsersLayoutModule,
    AddToPlaylistModule,
    AddAllToPlaylistModule,
    NumberPipeModule,
    DateTimePipeModule,
    ValidationPipeModule,
    CommonDirectiveModule,
    LazyLoadImageModule,
    LazyloadImageExtraModule,
    InfiniteScrollModule,
    FormDirectiveModule,
    CdkMenuCustomModule,
    StarRatingModule,
    SkeletonModule,
    AutoCompleteModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    CalendarModule,
    DropdownModule,
    DynamicDialogModule,
    AltSelectButtonModule,
    AltToggleButtonModule,
    AltTooltipModule,
    RadioButtonModule,
    ProgressBarModule,
    InputSwitchModule,
    TableModule
  ],
  providers: [
    UsersService,
    DialogService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: ['users', 'media']
    }
  ]
})
export class UsersModule { }
