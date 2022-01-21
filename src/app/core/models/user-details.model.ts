import { ShortDate, User } from '.';

export class UserDetails extends User {
  email?: string;
  birthdate?: ShortDate;
  verified?: boolean;
}
