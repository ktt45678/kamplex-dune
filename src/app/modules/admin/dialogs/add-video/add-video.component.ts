import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';

import { DestroyService, MediaService } from '../../../../core/services';

@Component({
  selector: 'app-add-video',
  templateUrl: './add-video.component.html',
  styleUrls: ['./add-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class AddVideoComponent implements OnInit {
  youtubeUrl = 'https://www.youtube.com/embed/';
  addingVideo: boolean = false;
  previewVideoKey?: string;
  addVideoForm: FormGroup;

  constructor(private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig, private mediaService: MediaService,
    private destroyService: DestroyService) {
    this.addVideoForm = new FormGroup({
      name: new FormControl(null, [Validators.maxLength(50)]),
      url: new FormControl(null, [Validators.required])
    });
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
    const mediaId = this.config.data['_id'];
    this.mediaService.addVideo(mediaId, {
      name: this.addVideoForm.value['name'],
      url: this.addVideoForm.value['url'],
    }).pipe(takeUntil(this.destroyService)).subscribe({
      next: (videos) => {
        this.dialogRef.close(videos);
      }
    });
  }

  onAddVideoFormCancel(): void {
    this.dialogRef.close();
  }

}
