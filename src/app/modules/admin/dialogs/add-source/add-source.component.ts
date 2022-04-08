import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { DestroyService, MediaService, QueueUploadService } from '../../../../core/services';

@Component({
  selector: 'app-add-source',
  templateUrl: './add-source.component.html',
  styleUrls: ['./add-source.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class AddSourceComponent implements OnInit {
  addingSource: boolean = false;

  constructor(private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private mediaService: MediaService, private queueUploadService: QueueUploadService,
    private destroyService: DestroyService) { }

  ngOnInit(): void {
  }

  uploadFile(file: File): void {
    const mediaId = this.config.data._id;
    this.addingSource = true;
    this.queueUploadService.addToQueue(mediaId, file, `media/${mediaId}/movie/source`, `media/${mediaId}/movie/source/:id`);
    this.dialogRef.close();
  }

  onAddSourceFormCancel(): void {
    this.dialogRef.close();
  }

}
