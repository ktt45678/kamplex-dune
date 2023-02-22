import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';

import { DestroyService, MediaService } from '../../../../core/services';
import { YOUTUBE_EMBED_URL } from '../../../../../environments/config';
import { MediaDetails } from '../../../../core/models';

interface AddVideoForm {
  name: FormControl<string | null>;
  url: FormControl<string>
}

@Component({
  selector: 'app-add-video',
  templateUrl: './add-video.component.html',
  styleUrls: ['./add-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class AddVideoComponent implements OnInit {
  youtubeUrl = YOUTUBE_EMBED_URL;
  isAddingVideo: boolean = false;
  previewVideoKey?: string;
  addVideoForm: FormGroup<AddVideoForm>;

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig<MediaDetails>,
    private mediaService: MediaService, private destroyService: DestroyService) {
    this.addVideoForm = new FormGroup<AddVideoForm>({
      name: new FormControl('', Validators.maxLength(50)),
      url: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(1000)] })
    }, { updateOn: 'change' });
  }

  ngOnInit(): void {
    this.enableVideoPreview();
  }

  enableVideoPreview(): void {
    const urlControl = this.addVideoForm.get('url');
    if (!urlControl) return;
    urlControl.valueChanges.pipe(takeUntil(this.destroyService)).subscribe((value: string) => {
      if (urlControl.valid) {
        const urlMatch = value.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/);
        if (urlMatch && urlMatch[1].length === 11) {
          this.previewVideoKey = urlMatch[1];
          return;
        }
      }
      this.previewVideoKey = undefined;
    });
  }

  onAddVideoFormSubmit(): void {
    if (this.addVideoForm.invalid) return;
    this.isAddingVideo = true;
    const mediaId = this.config.data!._id;
    const formValue = this.addVideoForm.getRawValue();
    this.mediaService.addVideo(mediaId, {
      name: formValue.name,
      url: formValue.url,
    }).pipe(takeUntil(this.destroyService)).subscribe({
      next: (videos) => {
        this.dialogRef.close(videos);
      },
      error: () => {
        this.isAddingVideo = false;
        this.ref.markForCheck();
      }
    });
  }

  onAddVideoFormCancel(): void {
    this.dialogRef.close();
  }

}
