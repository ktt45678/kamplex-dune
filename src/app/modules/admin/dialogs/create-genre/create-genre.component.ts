import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';

import { DestroyService, GenresService } from '../../../../core/services';

interface CreateGenreForm {
  name: FormControl<string>;
}

@Component({
  selector: 'app-create-genre',
  templateUrl: './create-genre.component.html',
  styleUrls: ['./create-genre.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class CreateGenreComponent implements OnInit {
  createGenreForm: FormGroup<CreateGenreForm>;

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private genresService: GenresService,
    private destroyService: DestroyService) {
    this.createGenreForm = new FormGroup<CreateGenreForm>({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(32)] })
    });
  }

  ngOnInit(): void {
  }

  onCreateGenreFormSubmit(): void {
    if (this.createGenreForm.invalid) return;
    this.createGenreForm.disable({ emitEvent: false });
    const formValue = this.createGenreForm.getRawValue();
    this.genresService.create({
      name: formValue.name
    }).pipe(takeUntil(this.destroyService)).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.createGenreForm.enable({ emitEvent: false });
        this.ref.markForCheck();
      }
    });
  }

  onCreateGenreFormCancel(): void {
    this.dialogRef.close(false);
  }

}
