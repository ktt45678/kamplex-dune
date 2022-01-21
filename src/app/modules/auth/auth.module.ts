import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { TranslocoModule, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { AuthRoutingModule } from './auth-routing.module';
import { ValidationPipeModule } from '../../shared/pipes/validation-pipe/validation-pipe.module';
import { FormDirectiveModule } from '../../shared/directives/form-directive';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { HomeLayoutModule } from '../../shared/layouts/home-layout';

@NgModule({
  declarations: [
    SignInComponent,
    SignUpComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    TranslocoModule,
    HomeLayoutModule,
    FormDirectiveModule,
    ValidationPipeModule,
    ProgressBarModule,
    InputTextModule,
    ButtonModule
  ],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'auth'
    }
  ]
})
export class AuthModule { }
