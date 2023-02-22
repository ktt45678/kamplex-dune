import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslocoService } from '@ngneat/transloco';
import { takeUntil } from 'rxjs';

import { DropdownOptionDto } from '../../../../core/dto/media';
import { MediaDetails, MediaSubtitle, TVEpisodeDetails } from '../../../../core/models';
import { DestroyService, ItemDataService, MediaService } from '../../../../core/services';
import { fileExtension, maxFileSize } from '../../../../core/validators';
import { UPLOAD_SUBTITLE_EXT, UPLOAD_SUBTITLE_SIZE } from '../../../../../environments/config';
import { AddSubtitleForm } from '../../../../core/interfaces/forms';
import { MediaType } from '../../../../core/enums';

@Component({
  selector: 'app-add-subtitle',
  templateUrl: './add-subtitle.component.html',
  styleUrls: ['./add-subtitle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class AddSubtitleComponent implements OnInit {
  languages?: DropdownOptionDto[];
  isAddingSubtitle: boolean = false;
  addSubtitleForm: FormGroup<AddSubtitleForm>;

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig<{ media: MediaDetails, episode: TVEpisodeDetails, file: File }>,
    private translocoService: TranslocoService, private itemDataService: ItemDataService, private mediaService: MediaService,
    private destroyService: DestroyService) {
    const lang = this.translocoService.getActiveLang();
    const file = this.config.data!.file || null;
    this.addSubtitleForm = new FormGroup<AddSubtitleForm>({
      language: new FormControl(lang, Validators.required),
      file: new FormControl(file, [Validators.required, maxFileSize(UPLOAD_SUBTITLE_SIZE), fileExtension(UPLOAD_SUBTITLE_EXT)])
    }, { updateOn: 'change' });
  }

  ngOnInit(): void {
    const subtitles: MediaSubtitle[] = this.config.data!.media.type === MediaType.MOVIE
      ? this.config.data!.media.movie.subtitles
      : this.config.data!.episode.subtitles;
    const disabledLanguages = subtitles.map(s => s.language);
    this.itemDataService.createLanguageList(disabledLanguages).subscribe({
      next: languages => this.languages = languages
    });
  }

  onAddSubtitleFormSubmit(): void {
    if (this.addSubtitleForm.invalid) return;
    this.isAddingSubtitle = true;
    const mediaType = this.config.data!.media.type;
    const mediaId = this.config.data!.media._id;
    const formValue = this.addSubtitleForm.getRawValue();
    if (mediaType === MediaType.MOVIE) {
      this.mediaService.addMovieSubtitle(mediaId, {
        language: formValue.language!,
        file: formValue.file!
      }).pipe(takeUntil(this.destroyService)).subscribe({
        next: subtitles => {
          this.dialogRef.close(subtitles);
        },
        error: () => {
          this.isAddingSubtitle = false;
          this.ref.markForCheck();
        }
      });
      return;
    }
    const episodeId = this.config.data!.episode._id;
    this.mediaService.addTVSubtitle(mediaId, episodeId, {
      language: formValue.language!,
      file: formValue.file!
    }).pipe(takeUntil(this.destroyService)).subscribe({
      next: subtitles => {
        this.dialogRef.close(subtitles);
      },
      error: () => {
        this.isAddingSubtitle = false;
        this.ref.markForCheck();
      }
    });
  }

  onAddSubtitleFormCancel(): void {
    this.dialogRef.close();
  }

  addSubtitleToForm(file: File): void {
    const fileControl = this.addSubtitleForm.get('file');
    if (!fileControl) return;
    fileControl.setValue(file);
    if (!fileControl.touched)
      fileControl.markAsTouched();
  }

}
