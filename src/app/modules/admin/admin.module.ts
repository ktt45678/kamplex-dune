import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SwiperModule } from 'swiper/angular';
import { ConfirmationService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutModule } from '../../shared/layouts/admin-layout';
import { MediaComponent } from './pages/media/media.component';
import { GenresComponent } from './pages/genres/genres.component';
import { ProducersComponent } from './pages/producers/producers.component';
import { CreateGenreComponent } from './dialogs/create-genre/create-genre.component';
import { UpdateGenreComponent } from './dialogs/update-genre/update-genre.component';
import { FileUploadModule } from '../../shared/components/file-upload';
import { FormDirectiveModule } from '../../shared/directives/form-directive';
import { ValidationPipeModule } from '../../shared/pipes/validation-pipe';
import { DatePipeModule } from '../../shared/pipes/date-pipe';
import { NumberPipeModule } from '../../shared/pipes/number-pipe';
import { UrlPipeModule } from '../../shared/pipes/url-pipe/url-pipe.module';
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
    AddSourceComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    TranslocoModule,
    AdminLayoutModule,
    FileUploadModule,
    FormDirectiveModule,
    ValidationPipeModule,
    DatePipeModule,
    NumberPipeModule,
    UrlPipeModule,
    AutoCompleteModule,
    LazyLoadImageModule,
    SwiperModule,
    ButtonModule,
    ChipModule,
    InputTextModule,
    InputTextareaModule,
    ToolbarModule,
    TooltipModule,
    TableModule,
    ProgressBarModule,
    DialogModule,
    DynamicDialogModule,
    ConfirmDialogModule,
    RadioButtonModule,
    InputSwitchModule,
    InputNumberModule,
    DropdownModule
  ],
  providers: [
    DialogService,
    ConfirmationService,
    MediaService,
    GenresService,
    ProducersService,
    QueueUploadService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'admin'
    }
  ]
})
export class AdminModule { }
