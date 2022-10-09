import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ConfirmEmailComponent } from './pages/confirm-email/confirm-email.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

const routes: Routes = [
  {
    title: 'signIn',
    path: 'sign-in',
    component: SignInComponent
  },
  {
    title: 'signUp',
    path: 'sign-up',
    component: SignUpComponent
  },
  {
    title: 'confirmEmail',
    path: 'confirm-email',
    component: ConfirmEmailComponent
  },
  {
    title: 'forgotPassword',
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    title: 'resetPassword',
    path: 'reset-password',
    component: ResetPasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
