import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { first, takeUntil } from 'rxjs';

import { DropdownOptionDto } from '../../../../core/dto/media';
import { DestroyService, ItemDataService, ProductionsService } from '../../../../core/services';

interface UpdateProductionForm {
  name: FormControl<string>;
  country: FormControl<string | null>;
}

@Component({
  selector: 'app-update-production',
  templateUrl: './update-production.component.html',
  styleUrls: ['./update-production.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class UpdateProductionComponent implements OnInit {
  isUpdatingProduction: boolean = false;
  updateProductionForm: FormGroup<UpdateProductionForm>;
  countryOptions?: DropdownOptionDto[];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private productionsService: ProductionsService, private itemDataService: ItemDataService,
    private destroyService: DestroyService) {
    this.updateProductionForm = new FormGroup<UpdateProductionForm>({
      name: new FormControl(this.config.data['name'] || '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] }),
      country: new FormControl(this.config.data['country'] || null)
    });
  }

  ngOnInit(): void {
    this.itemDataService.createCountryList().pipe(first()).subscribe({
      next: countries => this.countryOptions = countries
    });
  }

  onUpdateProductionFormSubmit(): void {
    if (this.updateProductionForm.invalid) return;
    this.isUpdatingProduction = true;
    const formValue = this.updateProductionForm.getRawValue();
    this.productionsService.update(this.config.data['_id'], {
      name: formValue.name,
      country: formValue.country
    }).pipe(takeUntil(this.destroyService)).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.isUpdatingProduction = false;
        this.ref.markForCheck();
      }
    });
  }

  onUpdateProductionFormCancel(): void {
    this.dialogRef.close(false);
  }

}
