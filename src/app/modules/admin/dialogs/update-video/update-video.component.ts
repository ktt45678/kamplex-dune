import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { first, takeUntil } from 'rxjs';

import { DropdownOptionDto, UpdateMediaVideoDto } from '../../../../core/dto/media';
import { DestroyService, ItemDataService, MediaService } from '../../../../core/services';

@Component({
  selector: 'app-update-video',
  templateUrl: './update-video.component.html',
  styleUrls: ['./update-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class UpdateVideoComponent implements OnInit {
  youtubeUrl = 'https://www.youtube.com/embed/';
  updatingVideo: boolean = false;
  previewVideoKey?: string;
  updateVideoForm: FormGroup;
  translateOptions: DropdownOptionDto[] = [];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private mediaService: MediaService, private itemDataService: ItemDataService, private destroyService: DestroyService) {
    const videoUrl = `https://www.youtube.com/watch?v=${this.config.data['video']['key']}`;
    this.updateVideoForm = new FormGroup({
      name: new FormControl(this.config.data['video']['name'], [Validators.maxLength(50)]),
      url: new FormControl(videoUrl),
      isTranslation: new FormControl(false),
      translate: new FormControl({ value: 'vi', disabled: true })
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
    urlControl.valueChanges.pipe(takeUntil(this.destroyService)).subscribe((value: string) => {
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
    this.updatingVideo = true;
    const mediaId = this.config.data['media']['_id'];
    const videoId = this.config.data['video']['_id'];
    const params = new UpdateMediaVideoDto();
    params.name = this.updateVideoForm.value['name'];
    params.url = this.updateVideoForm.value['url'];
    this.updateVideoForm.value['isTranslation'] && (params.translate = this.updateVideoForm.value['translate']);
    this.mediaService.updateVideo(mediaId, videoId, params).pipe(takeUntil(this.destroyService)).subscribe({
      next: (videos) => {
        this.dialogRef.close(videos);
      }, error: () => {
        this.updatingVideo = false;
        this.ref.markForCheck();
      }
    });
  }

  onUpdateVideoFormCancel(): void {
    this.dialogRef.close();
  }

}
