import { ShortDate } from '../../models';

export interface SignUpDto {
  username: string;
  email: string;
  password: string;
  birthdate: ShortDate;
}
