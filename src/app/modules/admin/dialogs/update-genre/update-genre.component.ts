import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { UpdateGenreDto } from '../../../../core/dto/genres';
import { DropdownOptionDto } from '../../../../core/dto/media';
import { GenresService } from '../../../../core/services';

@Component({
  selector: 'app-update-genre',
  templateUrl: './update-genre.component.html',
  styleUrls: ['./update-genre.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GenresService]
})
export class UpdateGenreComponent implements OnInit {
  isUpdatingGenre: boolean = false;
  updateGenreForm: FormGroup;
  translateOptions: DropdownOptionDto[];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private genresService: GenresService) {
    this.updateGenreForm = new FormGroup({
      name: new FormControl(this.config.data['name'] || '', [Validators.maxLength(32)]),
      isTranslation: new FormControl(false),
      translate: new FormControl('vi')
    });
    this.translateOptions = [
      {
        label: 'Vietnamese',
        value: 'vi'
      }
    ];
  }

  ngOnInit(): void {
  }

  onUpdateGenreFormSubmit(): void {
    if (this.updateGenreForm.invalid) return;
    this.isUpdatingGenre = true;
    const params = new UpdateGenreDto();
    params.name = this.updateGenreForm.value['name'];
    this.updateGenreForm.value['isTranslation'] && (params.translate = this.updateGenreForm.value['translate']);
    this.genresService.update(this.config.data['_id'], params).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.isUpdatingGenre = false;
        this.ref.markForCheck();
      }
    });
  }

  onUpdateGenreFormCancel(): void {
    this.dialogRef.close(false);
  }

}
