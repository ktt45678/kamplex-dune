import { ShortDate } from '.';

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
  stillColor?: number;
  stillPlaceholder?: string;
  pStatus?: number;
  status: number;
}
