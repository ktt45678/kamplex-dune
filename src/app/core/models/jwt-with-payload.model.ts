import { JWT, UserDetails } from '.';

export class JWTWithPayload extends JWT {
  payload!: UserDetails;
}
