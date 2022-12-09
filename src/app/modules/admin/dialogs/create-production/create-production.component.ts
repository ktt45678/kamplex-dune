import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';

import { DropdownOptionDto } from '../../../../core/dto/media';
import { DestroyService, ItemDataService, ProductionsService } from '../../../../core/services';

interface CreateProductionForm {
  name: FormControl<string>;
  country: FormControl<string | null>;
}

@Component({
  selector: 'app-create-production',
  templateUrl: './create-production.component.html',
  styleUrls: ['./create-production.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class CreateProductionComponent implements OnInit {
  createProductionForm: FormGroup<CreateProductionForm>;
  countryOptions?: DropdownOptionDto[];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private productionsService: ProductionsService,
    private itemDataService: ItemDataService, private destroyService: DestroyService) {
    this.createProductionForm = new FormGroup<CreateProductionForm>({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] }),
      country: new FormControl(null)
    }, { updateOn: 'change' });
  }

  ngOnInit(): void {
    this.itemDataService.createCountryList().subscribe({
      next: countries => this.countryOptions = countries
    });
  }

  onCreateProductionFormSubmit(): void {
    if (this.createProductionForm.invalid) return;
    this.createProductionForm.disable({ emitEvent: false });
    const formValue = this.createProductionForm.getRawValue();
    this.productionsService.create({
      name: formValue.name,
      country: formValue.country
    }).pipe(takeUntil(this.destroyService)).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.createProductionForm.enable({ emitEvent: false });
        this.ref.markForCheck();
      }
    });
  }

  onCreateProductionFormCancel(): void {
    this.dialogRef.close(false);
  }

}
