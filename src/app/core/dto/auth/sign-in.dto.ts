import { email, required } from '@rxweb/reactive-form-validators';

export class SignInDto {
  @required()
  @email()
  email!: string;

  @required()
  password!: string;
}
