import { ShortDate } from '../../models';

export class SignUpDto {
  username!: string;
  email!: string;
  password!: string;
  birthdate!: ShortDate;
}
