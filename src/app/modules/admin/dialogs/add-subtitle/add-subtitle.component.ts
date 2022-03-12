import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { first, takeUntil } from 'rxjs';

import { DropdownOptionDto } from '../../../../core/dto/media';
import { MediaSubtitle } from '../../../../core/models';
import { DestroyService, ItemDataService, MediaService } from '../../../../core/services';
import { fileExtension, maxFileSize } from '../../../../core/validators';

@Component({
  selector: 'app-add-subtitle',
  templateUrl: './add-subtitle.component.html',
  styleUrls: ['./add-subtitle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class AddSubtitleComponent implements OnInit {
  languages?: DropdownOptionDto[];
  addingSubtitle: boolean = false;
  addSubtitleForm: FormGroup;

  constructor(private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private itemDataService: ItemDataService, private mediaService: MediaService, private destroyService: DestroyService) {
    this.addSubtitleForm = new FormGroup({
      language: new FormControl(null, [Validators.required]),
      file: new FormControl(null, [Validators.required, maxFileSize(512000), fileExtension('.vtt')])
    });
  }

  ngOnInit(): void {
    const disabledLanguages = this.config.data.movie.subtitles.map((s: MediaSubtitle) => s.language);
    this.itemDataService.createLanguageList(disabledLanguages).pipe(first()).subscribe({
      next: languages => this.languages = languages
    });
  }

  onAddSubtitleFormSubmit(): void {
    if (this.addSubtitleForm.invalid) return;
    this.addingSubtitle = true;
    const mediaId = this.config.data._id;
    this.mediaService.addMovieSubtitle(mediaId, {
      language: this.addSubtitleForm.value['language'],
      file: this.addSubtitleForm.value['file']
    }).pipe(takeUntil(this.destroyService)).subscribe({
      next: subtitles => {
        this.dialogRef.close(subtitles);
      }
    });
  }

  onAddSubtitleFormCancel(): void {
    this.dialogRef.close();
  }

  /*
  getFileFromInput(event: Event): void {
    const element = <HTMLInputElement>event.target;
    if (!element.files?.length) return;
    this.addSubtitleToForm(element.files[0]);
  }
  */

  addSubtitleToForm(file: File): void {
    const fileControl = this.addSubtitleForm.get('file');
    if (!fileControl) return;
    fileControl.setValue(file);
    if (!fileControl.touched)
      fileControl.markAsTouched();
  }

}
