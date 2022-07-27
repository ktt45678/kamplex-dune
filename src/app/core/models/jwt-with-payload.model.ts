import { JWT, UserDetails } from '.';

export interface JWTWithPayload extends JWT {
  payload: UserDetails;
}
