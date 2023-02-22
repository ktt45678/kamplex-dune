import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RecaptchaComponent } from 'ng-recaptcha';
import { finalize, interval, Observable, takeUntil, takeWhile, tap } from 'rxjs';

import { AuthService, DestroyService } from '../../../../core/services';
import { SEND_RECOVERY_EMAIL_LIMIT_TTL } from '../../../../../environments/config';

interface RecoverPasswordForm {
  email: FormControl<string>;
  captcha: FormControl<string>;
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class ForgotPasswordComponent implements OnInit {
  @ViewChild('reCaptcha') reCaptcha?: RecaptchaComponent;
  recoverPasswordForm: FormGroup<RecoverPasswordForm>;
  success: boolean = false;
  canResendEmail: boolean = true;
  resendEmailTtl: number = 0;

  constructor(private ref: ChangeDetectorRef, private authService: AuthService, private router: Router,
    private destroyService: DestroyService) {
    this.recoverPasswordForm = new FormGroup<RecoverPasswordForm>({
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      captcha: new FormControl('', { nonNullable: true, validators: Validators.required })
    }, { updateOn: 'change' });
  }

  ngOnInit(): void {
    if (this.authService.currentUser) {
      this.router.navigate(['/']);
    }
  }

  onRecoverPasswordFormSubmit(): void {
    if (this.recoverPasswordForm.invalid)
      return;
    this.recoverPasswordForm.disable({ emitEvent: false });
    const formValue = this.recoverPasswordForm.getRawValue();
    this.authService.sendRecoveryEmail({
      email: formValue.email,
      captcha: formValue.captcha
    }).subscribe(() => {
      this.success = true;
      this.createRateLimitInterval().subscribe();
    }).add(() => {
      this.reCaptcha?.reset();
      this.recoverPasswordForm.enable({ emitEvent: false });
      this.ref.markForCheck();
    });
  }

  resendEmail(): void {
    if (this.recoverPasswordForm.invalid)
      return;
    this.recoverPasswordForm.disable({ emitEvent: false });
    const formValue = this.recoverPasswordForm.getRawValue();
    this.authService.sendRecoveryEmail({
      email: formValue.email,
      captcha: formValue.captcha
    }).subscribe(() => {
      this.createRateLimitInterval().subscribe();
    }).add(() => {
      this.reCaptcha?.reset();
      this.recoverPasswordForm.enable({ emitEvent: false });
      this.ref.markForCheck();
    });
  }

  createRateLimitInterval(): Observable<number> {
    this.canResendEmail = false;
    this.resendEmailTtl = SEND_RECOVERY_EMAIL_LIMIT_TTL;
    return interval(1000).pipe(
      tap(() => {
        this.resendEmailTtl -= 1;
        this.ref.markForCheck();
      }),
      finalize(() => {
        this.canResendEmail = true;
      }),
      takeWhile(() => this.resendEmailTtl > 0),
      takeUntil(this.destroyService)
    );
  }

}
