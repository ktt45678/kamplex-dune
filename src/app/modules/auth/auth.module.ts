import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

import { AuthRoutingModule } from './auth-routing.module';
import { AvatarModule } from '../../shared/components/avatar';
import { ValidationPipeModule } from '../../shared/pipes/validation-pipe/validation-pipe.module';
import { DateTimePipeModule } from '../../shared/pipes/date-time-pipe';
import { StringPipeModule } from '../../shared/pipes/string-pipe';
import { PlaceholderPipeModule } from '../../shared/pipes/placeholder-pipe';
import { FormDirectiveModule } from '../../shared/directives/form-directive';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ConfirmEmailComponent } from './pages/confirm-email/confirm-email.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

@NgModule({
  declarations: [
    SignInComponent,
    SignUpComponent,
    ConfirmEmailComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    AvatarModule,
    FormDirectiveModule,
    ValidationPipeModule,
    DateTimePipeModule,
    StringPipeModule,
    PlaceholderPipeModule,
    ReactiveFormsModule,
    TranslocoModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    LazyLoadImageModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    InputTextModule,
    ButtonModule,
    DropdownModule
  ],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'auth'
    }
  ]
})
export class AuthModule { }
