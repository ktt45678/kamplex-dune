import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';

import { SignInDto } from '../../../../core/dto/auth';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInComponent implements OnInit {
  isSigningIn: boolean = false;
  signInForm: FormGroup;

  constructor(private formBuilder: RxFormBuilder) {
    this.signInForm = this.formBuilder.formGroup(new SignInDto());
  }

  ngOnInit(): void {

  }

  onSignInFormSubmit() {
    if (this.signInForm.invalid)
      return;
    this.isSigningIn = true;
  }

}
