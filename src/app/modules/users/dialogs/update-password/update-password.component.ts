import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';

import { RegexPattern } from '../../../../core/enums';
import { UserDetails } from '../../../../core/models';
import { DestroyService, UsersService } from '../../../../core/services';
import { controlMatches } from '../../../../core/validators';

interface UpdatePasswordForm {
  currentPassword: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class UpdatePasswordComponent {
  updatePasswordForm: FormGroup<UpdatePasswordForm>;
  showPassword: boolean = false;

  constructor(private ref: ChangeDetectorRef, private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig<UserDetails>, private usersService: UsersService,
    private destroyService: DestroyService) {
    this.updatePasswordForm = new FormGroup<UpdatePasswordForm>({
      currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(128)] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128), Validators.pattern(RegexPattern.ACCOUNT_PASSWORD)] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required], updateOn: 'blur' })
    }, { validators: [controlMatches('confirmPassword', 'password')] });
  }

  onUpdatePasswordFormSubmit(): void {
    if (this.updatePasswordForm.invalid) return;
    this.updatePasswordForm.disable({ emitEvent: false });
    const formValue = this.updatePasswordForm.getRawValue();
    this.usersService.update(this.config.data!._id, {
      currentPassword: formValue.currentPassword,
      password: formValue.password
    }).pipe(takeUntil(this.destroyService)).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.updatePasswordForm.enable({ emitEvent: false });
        this.ref.markForCheck();
      }
    });
  }

  onUpdatePasswordFormCancel(): void {
    this.dialogRef.close();
  }
}
