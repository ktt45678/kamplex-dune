import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TranslocoService } from '@ngneat/transloco';

import { ToastKey } from '../../../../core/enums';
import { AuthService, ItemDataService } from '../../../../core/services';
import { shortDate } from '../../../../core/validators';
import { DropdownOptionDto } from '../../../../core/dto/media';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDataService]
})
export class SignUpComponent implements OnInit {
  isSigningUp: boolean = false;
  signUpForm: FormGroup;
  days: DropdownOptionDto[];
  months: DropdownOptionDto[];
  years: DropdownOptionDto[];

  constructor(private ref: ChangeDetectorRef, private router: Router, private translocoService: TranslocoService,
    private messageService: MessageService, private authService: AuthService, private itemDataService: ItemDataService) {
    this.signUpForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(32)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]),
      birthdateDay: new FormControl(null),
      birthdateMonth: new FormControl(null),
      birthdateYear: new FormControl(null)
    }, {
      validators: shortDate('birthdateDay', 'birthdateMonth', 'birthdateYear', true, new Date())
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
    this.authService.signUp({
      username: this.signUpForm.value.username,
      email: this.signUpForm.value.email,
      password: this.signUpForm.value.password,
      birthdate: {
        day: this.signUpForm.value.birthdateDay,
        month: this.signUpForm.value.birthdateMonth,
        year: this.signUpForm.value.birthdateYear
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
