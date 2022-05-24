import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';

import { DestroyService, QueueUploadService } from '../../../../core/services';
import { fileExtension, maxFileSize } from '../../../../core/validators';
import { UPLOAD_MEDIA_SOURCE_EXT, UPLOAD_MEDIA_SOURCE_MAX_SIZE } from '../../../../../environments/config';

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
  addSourceForm: FormGroup;

  constructor(private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig, private queueUploadService: QueueUploadService,
    private destroyService: DestroyService) {
    this.addSourceForm = new FormGroup({
      file: new FormControl(null,
        [Validators.required, maxFileSize(UPLOAD_MEDIA_SOURCE_MAX_SIZE), fileExtension(UPLOAD_MEDIA_SOURCE_EXT)]
      )
    });
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
    const mediaId = this.config.data._id;
    this.queueUploadService.addToQueue(mediaId, file, `media/${mediaId}/movie/source`, `media/${mediaId}/movie/source/:id`);
  }

  onAddSourceFormSubmit(): void {
    if (this.addSourceForm.invalid) return;
    this.isAddingSource = true;
    this.uploadFile(this.addSourceForm.value['file']);
    this.dialogRef.close();
  }

  onAddSourceFormCancel(): void {
    this.dialogRef.close();
  }

}
