import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';

import { UserDetails } from '../../../../core/models';
import { DestroyService, UsersService } from '../../../../core/services';

interface UpdateEmailForm {
  email: FormControl<string>;
  currentPassword: FormControl<string>;
}

@Component({
  selector: 'app-update-email',
  templateUrl: './update-email.component.html',
  styleUrls: ['./update-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class UpdateEmailComponent {
  updateEmailForm: FormGroup<UpdateEmailForm>;
  updatedEmail?: string;

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig<UserDetails>, private usersService: UsersService,
    private destroyService: DestroyService) {
    this.updateEmailForm = new FormGroup<UpdateEmailForm>({
      email: new FormControl(this.config.data!.email || '', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(128)] })
    });
  }

  onUpdateEmailFormSubmit(): void {
    if (this.updateEmailForm.invalid) return;
    this.updateEmailForm.disable({ emitEvent: false });
    const formValue = this.updateEmailForm.getRawValue();
    this.usersService.update(this.config.data!._id, {
      email: formValue.email,
      currentPassword: formValue.currentPassword
    }).pipe(takeUntil(this.destroyService)).subscribe({
      next: (user) => {
        this.updatedEmail = user.email;
      },
      error: () => {
        this.updateEmailForm.enable({ emitEvent: false });
      }
    }).add(() => {
      this.ref.markForCheck();
    });
  }

  onUpdateEmailFormCancel(): void {
    this.dialogRef.close();
  }

  onClose(): void {
    this.dialogRef.close(this.updatedEmail);
  }
}
