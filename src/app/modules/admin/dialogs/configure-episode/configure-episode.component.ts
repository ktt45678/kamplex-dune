import { DOCUMENT } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, Inject, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslocoService, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { first } from 'rxjs';

import { DropdownOptionDto } from '../../../../core/dto/media';
import { ItemDataService, MediaService, QueueUploadService } from '../../../../core/services';
import { fileExtension, maxFileSize } from '../../../../core/validators';
import { SUBTITLE_UPLOAD_EXT, SUBTITLE_UPLOAD_SIZE } from '../../../../../environments/config';
import { MediaSubtitle, TVEpisodeDetails } from '../../../../core/models';

@Component({
  selector: 'app-configure-episode',
  templateUrl: './configure-episode.component.html',
  styleUrls: ['./configure-episode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ItemDataService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'media',
      multi: true
    },
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'languages',
      multi: true
    }
  ]
})
export class ConfigureEpisodeComponent implements OnInit {
  loadingEpisode: boolean = false;
  episode?: TVEpisodeDetails;
  addSubtitleLanguages?: DropdownOptionDto[];
  addSubtitleForm: FormGroup;

  constructor(@Inject(DOCUMENT) private document: Document, private ref: ChangeDetectorRef, private renderer: Renderer2,
    private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private confirmationService: ConfirmationService, private mediaService: MediaService, private itemDataService: ItemDataService,
    private queueUploadService: QueueUploadService, private translocoService: TranslocoService) {
    this.addSubtitleForm = new FormGroup({
      language: new FormControl(null, [Validators.required]),
      file: new FormControl(null, [Validators.required, maxFileSize(SUBTITLE_UPLOAD_SIZE), fileExtension(SUBTITLE_UPLOAD_EXT)])
    });
  }

  ngOnInit(): void {
    this.loadEpisode();
  }

  loadEpisode(): void {
    if (!this.config.data) return;
    const mediaId = this.config.data['media']['_id'];
    const episodeId = this.config.data['episode']['_id'];
    this.loadingEpisode = true;
    this.mediaService.findOneTVEpisode(mediaId, episodeId).subscribe(episode => {
      this.episode = episode;
      this.loadSubtitleFormData(episode);
    }).add(() => {
      this.loadingEpisode = false;
      this.ref.markForCheck();
    });
  }

  loadSubtitleFormData(episode: TVEpisodeDetails): void {
    const disabledLanguages = episode.subtitles.map((s: MediaSubtitle) => s.language);
    this.itemDataService.createLanguageList(disabledLanguages).pipe(first()).subscribe({
      next: languages => this.addSubtitleLanguages = languages
    });
  }

}
