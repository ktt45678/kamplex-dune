import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, interval, switchMap, takeUntil, takeWhile, tap } from 'rxjs';

import { RegexPattern } from '../../../../core/enums';
import { AuthService, DestroyService, ItemDataService } from '../../../../core/services';
import { shortDate } from '../../../../core/validators';
import { DropdownOptionDto } from '../../../../core/dto/media';
import { ShortDateForm } from '../../../../core/interfaces/forms';
import { SEND_CONFIRM_EMAIL_LIMIT_TTL } from '../../../../../environments/config';

interface SignUpForm {
  username: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  birthdate: FormGroup<ShortDateForm>;
}

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService, DestroyService]
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup<SignUpForm>;
  days: DropdownOptionDto[];
  months: DropdownOptionDto[];
  years: DropdownOptionDto[];
  showPassword: boolean = false;
  success: boolean = false;
  canResendEmail: boolean = true;
  resendEmailTtl: number = 0;
  continueUrl: string;

  constructor(private ref: ChangeDetectorRef, private authService: AuthService, private route: ActivatedRoute, private router: Router,
    private itemDataService: ItemDataService, private destroyService: DestroyService) {
    this.signUpForm = new FormGroup<SignUpForm>({
      username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(32)] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128), Validators.pattern(RegexPattern.ACCOUNT_PASSWORD)] }),
      birthdate: new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, {
        validators: shortDate('day', 'month', 'year', true, new Date()),
        updateOn: 'change'
      })
    }, { updateOn: 'change' });
    this.days = this.itemDataService.createDateList();
    this.months = this.itemDataService.createMonthList();
    this.years = this.itemDataService.createYearList(1920);
    this.continueUrl = this.route.snapshot.queryParams['continue'] || '/';
  }

  ngOnInit(): void {
    if (this.authService.currentUser) {
      this.router.navigate([this.continueUrl]);
    }
  }

  onsignUpFormSubmit(): void {
    if (this.signUpForm.invalid)
      return;
    this.signUpForm.disable({ emitEvent: false });
    const formValue = this.signUpForm.getRawValue();
    this.authService.signUp({
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      birthdate: {
        day: formValue.birthdate.day!,
        month: formValue.birthdate.month!,
        year: formValue.birthdate.year!
      }
    }).subscribe(() => {
      this.success = true;
    }).add(() => {
      this.signUpForm.enable({ emitEvent: false });
      this.ref.markForCheck();
    });
  }

  resendEmail(): void {
    if (!this.authService.accessTokenValue)
      return;
    this.signUpForm.disable({ emitEvent: false });
    this.canResendEmail = false;
    this.authService.sendConfirmEmail().pipe(
      switchMap(() => {
        this.signUpForm.enable({ emitEvent: false });
        this.resendEmailTtl = SEND_CONFIRM_EMAIL_LIMIT_TTL;
        return interval(1000);
      }),
      tap(() => {
        this.resendEmailTtl -= 1;
        this.ref.markForCheck();
      }),
      finalize(() => {
        this.canResendEmail = true;
        this.ref.markForCheck();
      }),
      takeWhile(() => this.resendEmailTtl > 0),
      takeUntil(this.destroyService)
    ).subscribe();
  }

}
