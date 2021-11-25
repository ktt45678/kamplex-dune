import { User } from '.';

export class UserDetails extends User {
  email?: string;
  birthdate?: string;
  verified?: boolean;
}
