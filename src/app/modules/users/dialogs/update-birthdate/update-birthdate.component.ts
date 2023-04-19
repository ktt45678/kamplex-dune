import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';

import { DropdownOptionDto } from '../../../../core/dto/media';
import { ShortDateForm } from '../../../../core/interfaces/forms';
import { UserDetails } from '../../../../core/models';
import { DestroyService, ItemDataService, UsersService } from '../../../../core/services';
import { shortDate } from '../../../../core/validators';

interface UpdateBirthdateForm {
  birthdate: FormGroup<ShortDateForm>;
}

@Component({
  selector: 'app-update-birthdate',
  templateUrl: './update-birthdate.component.html',
  styleUrls: ['./update-birthdate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class UpdateBirthdateComponent {
  updateBirthdateForm: FormGroup<UpdateBirthdateForm>;
  days: DropdownOptionDto[];
  months: DropdownOptionDto[];
  years: DropdownOptionDto[];

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig<UserDetails>, private usersService: UsersService,
    private itemDataService: ItemDataService, private destroyService: DestroyService) {
    this.updateBirthdateForm = new FormGroup<UpdateBirthdateForm>({
      birthdate: new FormGroup<ShortDateForm>({
        day: new FormControl(this.config.data!.birthdate?.day || null),
        month: new FormControl(this.config.data!.birthdate?.month || null),
        year: new FormControl(this.config.data!.birthdate?.year || null)
      }, {
        validators: shortDate('day', 'month', 'year', true, new Date()),
        updateOn: 'change'
      })
    });
    this.days = this.itemDataService.createDateList();
    this.months = this.itemDataService.createMonthList();
    this.years = this.itemDataService.createYearList(1920);
  }

  onUpdateBirthdateFormSubmit(): void {
    if (this.updateBirthdateForm.invalid) return;
    this.updateBirthdateForm.disable({ emitEvent: false });
    const formValue = this.updateBirthdateForm.getRawValue();
    const { day, month, year } = formValue.birthdate;
    const birthdate = (day != undefined && month != undefined && year != undefined) ? { day, month, year } : null;
    this.usersService.update(this.config.data!._id, { birthdate })
      .pipe(takeUntil(this.destroyService)).subscribe({
        next: (user) => this.dialogRef.close(user.birthdate),
        error: () => {
          this.updateBirthdateForm.enable({ emitEvent: false });
          this.ref.markForCheck();
        }
      });
  }

  onUpdateBirthdateFormCancel(): void {
    this.dialogRef.close();
  }
}
