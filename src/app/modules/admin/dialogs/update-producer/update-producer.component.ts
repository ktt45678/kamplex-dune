import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { first, takeUntil } from 'rxjs';

import { DropdownOptionDto } from '../../../../core/dto/media';
import { DestroyService, ItemDataService, ProducersService } from '../../../../core/services';

@Component({
  selector: 'app-update-producer',
  templateUrl: './update-producer.component.html',
  styleUrls: ['./update-producer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class UpdateProducerComponent implements OnInit {
  isUpdatingProducer: boolean = false;
  updateProducerForm: FormGroup;
  countryOptions?: DropdownOptionDto[];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private config: DynamicDialogConfig,
    private producersService: ProducersService, private itemDataService: ItemDataService,
    private destroyService: DestroyService) {
    this.updateProducerForm = new FormGroup({
      name: new FormControl(this.config.data['name'] || '', [Validators.required, Validators.maxLength(150)]),
      country: new FormControl(this.config.data['country'] || null)
    });
  }

  ngOnInit(): void {
    this.itemDataService.createCountryList().pipe(first()).subscribe({
      next: countries => this.countryOptions = countries
    });
  }

  onUpdateProducerFormSubmit(): void {
    if (this.updateProducerForm.invalid) return;
    this.isUpdatingProducer = true;
    this.producersService.update(this.config.data['_id'], {
      name: this.updateProducerForm.value['name'],
      country: this.updateProducerForm.value['country']
    }).pipe(takeUntil(this.destroyService)).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.isUpdatingProducer = false;
        this.ref.markForCheck();
      }
    });
  }

  onUpdateProducerFormCancel(): void {
    this.dialogRef.close(false);
  }

}
