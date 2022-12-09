import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { RegexPattern } from '../../../../core/enums';
import { AuthService } from '../../../../core/services';

interface ResetPasswordForm {
  password: FormControl<string>;
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup<ResetPasswordForm>;
  id: string | null;
  recoveryCode: string | null;
  showPassword: boolean = false;
  success: boolean = false;

  constructor(private ref: ChangeDetectorRef, private route: ActivatedRoute, private authService: AuthService) {
    this.resetPasswordForm = new FormGroup<ResetPasswordForm>({
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128), Validators.pattern(RegexPattern.ACCOUNT_PASSWORD)] })
    }, { updateOn: 'change' });
    this.id = this.route.snapshot.queryParamMap.get('id');
    this.recoveryCode = this.route.snapshot.queryParamMap.get('code');
  }

  onResetPasswordFormSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.id || !this.recoveryCode)
      return;
    this.resetPasswordForm.disable({ emitEvent: false });
    const formValue = this.resetPasswordForm.getRawValue();
    this.authService.resetPassword({
      id: this.id,
      recoveryCode: this.recoveryCode,
      password: formValue.password
    }).subscribe(() => {
      this.success = true;
    }).add(() => {
      this.resetPasswordForm.enable({ emitEvent: false });
      this.ref.markForCheck();
    });
  }

}
