import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';

import { DestroyService, QueueUploadService } from '../../../../core/services';
import { fileExtension, maxFileSize } from '../../../../core/validators';
import { UPLOAD_MEDIA_SOURCE_EXT, UPLOAD_MEDIA_SOURCE_MAX_SIZE } from '../../../../../environments/config';
import { MediaType } from '../../../../core/enums';

interface AddSourceForm {
  file: FormControl<File | null>;
}

@Component({
  selector: 'app-add-source',
  templateUrl: './add-source.component.html',
  styleUrls: ['./add-source.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class AddSourceComponent implements OnInit {
  @ViewChild('addSourceFormElement') addSourceFormElement?: NgForm;
  isAddingSource: boolean = false;
  addSourceForm: FormGroup<AddSourceForm>;

  constructor(private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig, private queueUploadService: QueueUploadService,
    private destroyService: DestroyService) {
    this.addSourceForm = new FormGroup<AddSourceForm>({
      file: new FormControl(null,
        [Validators.required, maxFileSize(UPLOAD_MEDIA_SOURCE_MAX_SIZE), fileExtension(UPLOAD_MEDIA_SOURCE_EXT)]
      )
    }, { updateOn: 'change' });
  }

  ngOnInit(): void {
    this.addSourceForm.statusChanges.pipe(takeUntil(this.destroyService)).subscribe({
      next: (status) => {
        if (status !== 'VALID') return;
        this.addSourceFormElement?.ngSubmit.emit();
      }
    });
  }

  uploadFile(file: File): void {
    const mediaId = this.config.data['media']['_id'];
    const mediaType = this.config.data['media']['type'];
    if (mediaType === MediaType.MOVIE) {
      this.queueUploadService.addToQueue(mediaId, file, `media/${mediaId}/movie/source`, `media/${mediaId}/movie/source/:id`);
      return;
    }
    const episodeId = this.config.data['episode']['_id'];
    this.queueUploadService.addToQueue(`${mediaId}:${episodeId}`, file, `media/${mediaId}/tv/episodes/${episodeId}/source`, `media/${mediaId}/tv/episodes/${episodeId}/source/:id`);
  }

  onAddSourceFormSubmit(): void {
    if (this.addSourceForm.invalid) return;
    this.isAddingSource = true;
    const formValue = this.addSourceForm.getRawValue();
    this.uploadFile(formValue.file!);
    this.dialogRef.close();
  }

  onAddSourceFormCancel(): void {
    this.dialogRef.close();
  }

}
