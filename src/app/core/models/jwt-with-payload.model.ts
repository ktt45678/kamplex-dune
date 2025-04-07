import type { JWT } from './jwt.model';
import type { UserDetails } from './user-details.model';

export interface JWTWithPayload extends JWT {
  payload: UserDetails;
}
