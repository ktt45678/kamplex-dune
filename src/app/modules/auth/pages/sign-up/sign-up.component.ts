import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TranslocoService } from '@ngneat/transloco';

import { ToastKey } from '../../../../core/enums';
import { AuthService, ItemDataService } from '../../../../core/services';
import { shortDate } from '../../../../core/validators';
import { DropdownOptionDto } from '../../../../core/dto/media';
import { ShortDateForm } from '../../../../core/interfaces/forms';

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
  providers: [ItemDataService]
})
export class SignUpComponent implements OnInit {
  isSigningUp: boolean = false;
  signUpForm: FormGroup<SignUpForm>;
  days: DropdownOptionDto[];
  months: DropdownOptionDto[];
  years: DropdownOptionDto[];

  constructor(private ref: ChangeDetectorRef, private router: Router, private translocoService: TranslocoService,
    private messageService: MessageService, private authService: AuthService, private itemDataService: ItemDataService) {
    this.signUpForm = new FormGroup<SignUpForm>({
      username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(32)] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128)] }),
      birthdate: new FormGroup<ShortDateForm>({
        day: new FormControl(null),
        month: new FormControl(null),
        year: new FormControl(null)
      }, {
        validators: shortDate('day', 'month', 'year', true, new Date())
      })
    });
    this.days = this.itemDataService.createDateList();
    this.months = this.itemDataService.createMonthList();
    this.years = this.itemDataService.createYearList(1920);
  }

  ngOnInit(): void {
  }

  onsignUpFormSubmit(): void {
    if (this.signUpForm.invalid)
      return;
    this.isSigningUp = true;
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
      this.messageService.add({
        key: ToastKey.APP, severity: 'info', summary: this.translocoService.translate('auth.signUp.successMessageSummary'),
        detail: this.translocoService.translate('auth.signUp.successMessageDetail')
      });
      this.router.navigate(['/']);
    }).add(() => {
      this.isSigningUp = false;
      this.ref.markForCheck();
    });
  }

}
