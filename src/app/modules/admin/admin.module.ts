import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ConfirmationService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutModule } from '../../shared/layouts/admin-layout';
import { MediaComponent } from './pages/media/media.component';
import { GenresComponent } from './pages/genres/genres.component';
import { ProducersComponent } from './pages/producers/producers.component';
import { CreateGenreComponent } from './dialogs/create-genre/create-genre.component';
import { UpdateGenreComponent } from './dialogs/update-genre/update-genre.component';
import { FileUploadModule } from '../../shared/components/file-upload';
import { VerticalTabModule } from '../../shared/components/vertical-tab';
import { ImageEditorModule } from '../../shared/dialogs/image-editor';
import { FormDirectiveModule } from '../../shared/directives/form-directive';
import { ValidationPipeModule } from '../../shared/pipes/validation-pipe';
import { DateTimePipeModule } from '../../shared/pipes/date-time-pipe';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { UrlPipeModule } from '../../shared/pipes/url-pipe/url-pipe.module';
import { WS_AUTH, WS_NAMESPACE, WsModule } from '../../shared/modules/ws';
import { CreateProducerComponent } from './dialogs/create-producer/create-producer.component';
import { UpdateProducerComponent } from './dialogs/update-producer/update-producer.component';
import { CreateMediaComponent } from './dialogs/create-media/create-media.component';
import { UpdateMediaComponent } from './dialogs/update-media/update-media.component';
import { AddVideoComponent } from './dialogs/add-video/add-video.component';
import { UpdateVideoComponent } from './dialogs/update-video/update-video.component';
import { CreateEpisodeComponent } from './dialogs/create-episode/create-episode.component';
import { UpdateEpisodeComponent } from './dialogs/update-episode/update-episode.component';
import { AddSubtitleComponent } from './dialogs/add-subtitle/add-subtitle.component';
import { ViewMediaComponent } from './dialogs/view-media/view-media.component';
import { ConfigureMediaComponent } from './dialogs/configure-media/configure-media.component';
import { AddSourceComponent } from './dialogs/add-source/add-source.component';
import { ConfirmDeactivateGuard, WsActivatorGuard } from '../../core/guards';
import { ConfigureEpisodeComponent } from './dialogs/configure-episode/configure-episode.component';
import { GenresService, MediaService, ProducersService, QueueUploadService } from '../../core/services';

@NgModule({
  declarations: [
    MediaComponent,
    GenresComponent,
    ProducersComponent,
    CreateGenreComponent,
    UpdateGenreComponent,
    CreateProducerComponent,
    UpdateProducerComponent,
    CreateMediaComponent,
    UpdateMediaComponent,
    ViewMediaComponent,
    ConfigureMediaComponent,
    AddVideoComponent,
    UpdateVideoComponent,
    CreateEpisodeComponent,
    UpdateEpisodeComponent,
    AddSubtitleComponent,
    AddSourceComponent,
    ConfigureEpisodeComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    TranslocoModule,
    AdminLayoutModule,
    FileUploadModule,
    VerticalTabModule,
    ImageEditorModule,
    FormDirectiveModule,
    ValidationPipeModule,
    DateTimePipeModule,
    NumberPipeModule,
    UrlPipeModule,
    AutoCompleteModule,
    LazyLoadImageModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    MenuModule,
    TooltipModule,
    TableModule,
    DialogModule,
    DynamicDialogModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    RadioButtonModule,
    InputSwitchModule,
    InputNumberModule,
    DropdownModule,
    MessageModule,
    WsModule
  ],
  providers: [
    DialogService,
    ConfirmationService,
    MediaService,
    GenresService,
    ProducersService,
    QueueUploadService,
    ConfirmDeactivateGuard,
    WsActivatorGuard,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'admin',
      multi: true
    },
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media',
      multi: true
    },
    {
      provide: WS_NAMESPACE,
      useValue: 'admin'
    },
    {
      provide: WS_AUTH,
      useValue: true
    }
  ]
})
export class AdminModule { }
