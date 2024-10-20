import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { TabMenuModule } from 'primeng/tabmenu';
import { SliderAltModule } from 'primeng/slideralt';
import { TableModule } from 'primeng/table';

import { UsersRoutingModule } from './users-routing.module';
import { UsersLayoutComponent } from './layouts/users-layout';
import { SettingsLayoutComponent } from './layouts/settings-layout';
import { ProfileComponent } from './pages/profile/profile.component';
import { PlaylistsComponent } from './pages/playlists/playlists.component';
import { HistoryComponent } from './pages/history/history.component';
import { AccountSettingsComponent } from './pages/settings/account-settings/account-settings.component';
import { ProfileSettingsComponent } from './pages/settings/profile-settings/profile-settings.component';
import { PrivacySettingsComponent } from './pages/settings/privacy-settings/privacy-settings.component';
import { MediaSettingsComponent } from './pages/settings/media-settings/media-settings.component';
import { SubtitleSettingsComponent } from './pages/settings/subtitle-settings/subtitle-settings.component';
import { PlaylistCardComponent } from './components/playlist-card';
import { HistoryCardComponent } from './components/history-card';
import { RatingCardComponent } from './components/rating-card';
import { ColorPickerModule } from '../../shared/components/color-picker';
import { CreatePlaylistComponent } from './dialogs/create-playlist';
import { UpdateUsernameComponent } from './dialogs/update-username';
import { UpdateEmailComponent } from './dialogs/update-email';
import { UpdatePasswordComponent } from './dialogs/update-password';
import { UpdateBirthdateComponent } from './dialogs/update-birthdate';
import { AddToPlaylistModule } from '../../shared/dialogs/add-to-playlist';
import { AddAllToPlaylistModule } from '../../shared/dialogs/add-all-to-playlist';
import { PlaylistSettingsModule } from '../../shared/dialogs/playlist-settings';
import { CommonDirectiveModule } from '../../shared/directives/common-directive';
import { FormDirectiveModule } from '../../shared/directives/form-directive';
import { CdkMenuCustomModule } from '../../shared/directives/cdk-menu-custom';
import { OverlayPanelModule } from '../../shared/directives/overlay-panel';
import { DateTimePipeModule } from '../../shared/pipes/date-time-pipe';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { ValidationPipeModule } from '../../shared/pipes/validation-pipe';
import { MarkdownPipeModule } from '../../shared/pipes/markdown-pipe';
import { HtmlPipeModule } from '../../shared/pipes/html-pipe';
import { StringPipeModule } from '../../shared/pipes/string-pipe';
import { PlaceholderPipeModule } from '../../shared/pipes/placeholder-pipe';
import { UsersService } from '../../core/services';
import { RatedComponent } from './pages/rated/rated.component';
import { StarRatingModule } from '../../shared/components/star-rating';
import { SkeletonModule } from '../../shared/components/skeleton';
import { AvatarModule } from '../../shared/components/avatar';
import { SelectOrderModule } from '../../shared/components/select-order';
import { AltAutoCompleteModule } from '../../core/utils/primeng';

@NgModule({
  declarations: [
    UsersLayoutComponent,
    SettingsLayoutComponent,
    ProfileComponent,
    PlaylistsComponent,
    HistoryComponent,
    RatedComponent,
    CreatePlaylistComponent,
    PlaylistCardComponent,
    HistoryCardComponent,
    RatingCardComponent,
    AccountSettingsComponent,
    ProfileSettingsComponent,
    PrivacySettingsComponent,
    MediaSettingsComponent,
    UpdateUsernameComponent,
    UpdateEmailComponent,
    UpdatePasswordComponent,
    UpdateBirthdateComponent,
    SubtitleSettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    DragDropModule,
    TranslocoModule,
    UsersRoutingModule,
    AddToPlaylistModule,
    AddAllToPlaylistModule,
    PlaylistSettingsModule,
    ColorPickerModule,
    AvatarModule,
    SelectOrderModule,
    NumberPipeModule,
    DateTimePipeModule,
    ValidationPipeModule,
    MarkdownPipeModule,
    HtmlPipeModule,
    StringPipeModule,
    PlaceholderPipeModule,
    CommonDirectiveModule,
    LazyLoadImageModule,
    InfiniteScrollModule,
    FormDirectiveModule,
    CdkMenuCustomModule,
    OverlayPanelModule,
    StarRatingModule,
    SkeletonModule,
    AltAutoCompleteModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    CalendarModule,
    DropdownModule,
    ConfirmDialogModule,
    DynamicDialogModule,
    RadioButtonModule,
    ProgressBarModule,
    InputSwitchModule,
    SelectButtonModule,
    ToggleButtonModule,
    TooltipModule,
    TabMenuModule,
    SliderAltModule,
    TableModule
  ],
  providers: [
    UsersService,
    DialogService,
    ConfirmationService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: ['users', 'media']
    }
  ]
})
export class UsersModule { }
