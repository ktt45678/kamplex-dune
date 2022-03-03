import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

import { GenresService } from '../../../../core/services';

@Component({
  selector: 'app-create-genre',
  templateUrl: './create-genre.component.html',
  styleUrls: ['./create-genre.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GenresService]
})
export class CreateGenreComponent implements OnInit {
  isCreatingGenre: boolean = false;
  createGenreForm: FormGroup;

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private genresService: GenresService) {
    this.createGenreForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(32)])
    });
  }

  ngOnInit(): void {
  }

  onCreateGenreFormSubmit(): void {
    if (this.createGenreForm.invalid) return;
    this.isCreatingGenre = true;
    this.genresService.create({
      name: this.createGenreForm.value['name']
    }).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.isCreatingGenre = false;
        this.ref.markForCheck();
      }
    });
  }

  onCreateGenreFormCancel(): void {
    this.dialogRef.close(false);
  }

}
