import { ShortDate, User } from '.';

export interface UserDetails extends User {
  email?: string;
  birthdate?: ShortDate;
  verified?: boolean;
}
