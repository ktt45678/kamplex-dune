import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, takeUntil, timer } from 'rxjs';
import { RecaptchaComponent } from 'ng-recaptcha';

import { AuthService, DestroyService } from '../../../../core/services';
import { SIGN_IN_LIMIT_COUNT, SIGN_IN_LIMIT_TTL } from '../../../../../environments/config';

interface SignInForm {
  email: FormControl<string>;
  password: FormControl<string>;
  captcha: FormControl<string | undefined | null>;
}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService]
})
export class SignInComponent {
  @ViewChild('reCaptcha') reCaptcha?: RecaptchaComponent;
  maxFailureCount: number = SIGN_IN_LIMIT_COUNT;
  continueUrl: string;
  signInForm: FormGroup<SignInForm>;
  failureCount: number = 0;

  constructor(private ref: ChangeDetectorRef, private route: ActivatedRoute, private router: Router,
    private authService: AuthService, private destroyService: DestroyService) {
    this.signInForm = new FormGroup<SignInForm>({
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(128)] }),
      captcha: new FormControl(undefined)
    });
    this.continueUrl = this.route.snapshot.queryParams['continue'] || '/';
  }

  onSignInFormSubmit(): void {
    if (this.signInForm.invalid)
      return;
    this.signInForm.disable({ emitEvent: false });
    this.authService.signIn(this.signInForm.getRawValue()).subscribe({
      next: () => this.router.navigate([this.continueUrl]),
      error: (error) => {
        if (error.status >= 400 && error.status <= 499 && error.status !== 429) {
          this.failureCount += 1;
        } else if (error.status === 429) {
          this.failureCount = this.maxFailureCount;
        }
        if (this.failureCount === this.maxFailureCount) {
          // Enable recaptcha now
          this.signInForm.controls.captcha.addValidators(Validators.required);
          this.removeCaptchaLater(error.error?.ttl || SIGN_IN_LIMIT_TTL);
        } else if (this.failureCount > this.maxFailureCount) {
          // Reset enabled recaptcha
          this.reCaptcha?.reset();
        }
      }
    }).add(() => {
      this.signInForm.enable({ emitEvent: false });
      this.ref.markForCheck();
    });
  }

  removeCaptchaLater(timeout: number): void {
    timer(timeout * 1000).pipe(
      finalize(() => {
        this.failureCount = 0;
        this.signInForm.controls.captcha.reset();
        this.signInForm.controls.captcha.clearValidators();
        this.signInForm.controls.captcha.setErrors(null);
        this.ref.markForCheck();
      }),
      takeUntil(this.destroyService)
    ).subscribe();
  }

}
