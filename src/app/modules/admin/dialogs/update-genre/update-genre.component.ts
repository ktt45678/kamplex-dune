import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { first, takeUntil } from 'rxjs';

import { UpdateGenreDto } from '../../../../core/dto/genres';
import { DropdownOptionDto } from '../../../../core/dto/media';
import { DestroyService, GenresService, ItemDataService } from '../../../../core/services';

@Component({
  selector: 'app-update-genre',
  templateUrl: './update-genre.component.html',
  styleUrls: ['./update-genre.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class UpdateGenreComponent implements OnInit {
  updatingGenre: boolean = false;
  updateGenreForm: FormGroup;
  translateOptions: DropdownOptionDto[] = [];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private genresService: GenresService, private itemDataService: ItemDataService, private destroyService: DestroyService) {
    this.updateGenreForm = new FormGroup({
      name: new FormControl(this.config.data['name'] || '', [Validators.maxLength(32)]),
      isTranslation: new FormControl(false),
      translate: new FormControl({ value: 'vi', disabled: true })
    });
  }

  ngOnInit(): void {
    this.itemDataService.createTranslateOptions().pipe(first()).subscribe({
      next: options => this.translateOptions = options
    });
  }

  onUpdateGenreFormSubmit(): void {
    if (this.updateGenreForm.invalid) return;
    this.updatingGenre = true;
    const params = new UpdateGenreDto();
    params.name = this.updateGenreForm.value['name'];
    this.updateGenreForm.value['isTranslation'] && (params.translate = this.updateGenreForm.value['translate']);
    this.genresService.update(this.config.data['_id'], params).pipe(takeUntil(this.destroyService)).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.updatingGenre = false;
        this.ref.markForCheck();
      }
    });
  }

  onUpdateGenreFormCancel(): void {
    this.dialogRef.close(false);
  }

}
