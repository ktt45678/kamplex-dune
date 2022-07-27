import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { first, takeUntil } from 'rxjs';

import { DropdownOptionDto, UpdateMediaVideoDto } from '../../../../core/dto/media';
import { DestroyService, ItemDataService, MediaService } from '../../../../core/services';
import { YOUTUBE_EMBED_URL } from '../../../../../environments/config';

interface UpdateVideoForm {
  name: FormControl<string | null>;
  url: FormControl<string | null>;
  isTranslation: FormControl<boolean>;
  translate: FormControl<string>;
}

@Component({
  selector: 'app-update-video',
  templateUrl: './update-video.component.html',
  styleUrls: ['./update-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class UpdateVideoComponent implements OnInit {
  youtubeUrl = YOUTUBE_EMBED_URL;
  isUpdatingVideo: boolean = false;
  previewVideoKey?: string;
  updateVideoForm: FormGroup<UpdateVideoForm>;
  translateOptions: DropdownOptionDto[] = [];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private mediaService: MediaService, private itemDataService: ItemDataService, private destroyService: DestroyService) {
    const videoUrl = `https://www.youtube.com/watch?v=${this.config.data['video']['key']}`;
    this.updateVideoForm = new FormGroup<UpdateVideoForm>({
      name: new FormControl(this.config.data['video']['name'] || '', [Validators.maxLength(50)]),
      url: new FormControl(videoUrl, [Validators.required, Validators.maxLength(1000)]),
      isTranslation: new FormControl(false, { nonNullable: true }),
      translate: new FormControl({ value: 'vi', disabled: true }, { nonNullable: true })
    });
  }

  ngOnInit(): void {
    this.itemDataService.createTranslateOptions().pipe(first()).subscribe({
      next: options => this.translateOptions = options
    });
    this.enableVideoPreview();
  }

  enableVideoPreview(): void {
    const urlControl = this.updateVideoForm.get('url');
    if (!urlControl) return;
    this.createVideoPreview(urlControl);
    urlControl.valueChanges.pipe(takeUntil(this.destroyService)).subscribe(value => {
      if (!value) return;
      this.createVideoPreview(urlControl, value);
    });
  }

  createVideoPreview(urlControl: AbstractControl, url?: string): void {
    if (urlControl.disabled) return;
    if (urlControl.valid) {
      const urlValue = url || urlControl.value;
      const urlMatch = urlValue.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/);
      if (urlMatch && urlMatch[1].length === 11) {
        this.previewVideoKey = urlMatch[1];
        return;
      }
    }
    this.previewVideoKey = undefined;
  }

  onUpdateVideoFormSubmit(): void {
    if (this.updateVideoForm.invalid) return;
    this.isUpdatingVideo = true;
    const mediaId = this.config.data['media']['_id'];
    const videoId = this.config.data['video']['_id'];
    const formValue = this.updateVideoForm.getRawValue();
    const params: UpdateMediaVideoDto = {
      name: formValue.name,
      url: formValue.url
    };
    formValue.isTranslation && (params.translate = formValue.translate);
    this.mediaService.updateVideo(mediaId, videoId, params).pipe(takeUntil(this.destroyService)).subscribe({
      next: (videos) => {
        this.dialogRef.close(videos);
      }, error: () => {
        this.isUpdatingVideo = false;
        this.ref.markForCheck();
      }
    });
  }

  onUpdateVideoFormCancel(): void {
    this.dialogRef.close();
  }

}
