import { ShortDate } from '../../models';

export interface UpdateUserDto {
  username?: string;
  nickname?: string | null;
  email?: string;
  about?: string | null;
  currentPassword?: string;
  password?: string;
  birthdate?: ShortDate | null;
  restoreAccount?: boolean;
  banned?: boolean;
}
