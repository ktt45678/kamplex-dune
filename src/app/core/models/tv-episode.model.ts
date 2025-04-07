import type { ShortDate } from './short-date.model';

export interface TVEpisode {
  _id: string;
  airDate: ShortDate;
  epNumber: number;
  runtime: number;
  name?: string;
  overview?: string;
  visibility: number;
  views: number;
  stillUrl?: string;
  thumbnailStillUrl?: string;
  smallStillUrl?: string;
  fullStillUrl?: string;
  stillColor?: number;
  stillPlaceholder?: string;
  pStatus?: number;
  status: number;
}
