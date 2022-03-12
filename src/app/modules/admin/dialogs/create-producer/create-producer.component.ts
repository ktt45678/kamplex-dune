import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { first, takeUntil } from 'rxjs';

import { DropdownOptionDto } from '../../../../core/dto/media';
import { DestroyService, ItemDataService, ProducersService } from '../../../../core/services';

@Component({
  selector: 'app-create-producer',
  templateUrl: './create-producer.component.html',
  styleUrls: ['./create-producer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class CreateProducerComponent implements OnInit {
  isCreatingProducer: boolean = false;
  createProducerForm: FormGroup;
  countryOptions?: DropdownOptionDto[];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef, private producersService: ProducersService,
    private itemDataService: ItemDataService, private destroyService: DestroyService) {
    this.createProducerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(150)]),
      country: new FormControl(null)
    });
  }

  ngOnInit(): void {
    this.itemDataService.createCountryList().pipe(first()).subscribe({
      next: countries => this.countryOptions = countries
    });
  }

  onCreateProducerFormSubmit(): void {
    if (this.createProducerForm.invalid) return;
    this.isCreatingProducer = true;
    this.producersService.create({
      name: this.createProducerForm.value['name'],
      country: this.createProducerForm.value['country']
    }).pipe(takeUntil(this.destroyService)).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.isCreatingProducer = false;
        this.ref.markForCheck();
      }
    });
  }

  onCreateProducerFormCancel(): void {
    this.dialogRef.close(false);
  }

}
