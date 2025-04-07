import type { ShortDate } from './short-date.model';
import type { User } from './user.model';
import type { UserSettings } from './user-settings.model';

export interface UserDetails extends User {
  email?: string;
  birthdate?: ShortDate | null;
  about?: string;
  settings?: UserSettings;
  verified?: boolean;
  granted?: number[];
  bannerUrl?: string;
  thumbnailBannerUrl?: string;
  smallBannerUrl?: string;
  fullBannerUrl?: string;
  bannerColor?: number;
  bannerPlaceholder?: string;
}
