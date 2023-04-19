import { ShortDate, User, UserSettings } from '.';

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
}
