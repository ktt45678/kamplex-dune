import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';

import { DestroyService, GenresService } from '../../../../core/services';

@Component({
  selector: 'app-create-genre',
  templateUrl: './create-genre.component.html',
  styleUrls: ['./create-genre.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class CreateGenreComponent implements OnInit {
  creatingGenre: boolean = false;
  createGenreForm: FormGroup;

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private genresService: GenresService,
    private destroyService: DestroyService) {
    this.createGenreForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(32)])
    });
  }

  ngOnInit(): void {
  }

  onCreateGenreFormSubmit(): void {
    if (this.createGenreForm.invalid) return;
    this.creatingGenre = true;
    this.genresService.create({
      name: this.createGenreForm.value['name']
    }).pipe(takeUntil(this.destroyService)).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.creatingGenre = false;
        this.ref.markForCheck();
      }
    });
  }

  onCreateGenreFormCancel(): void {
    this.dialogRef.close(false);
  }

}
