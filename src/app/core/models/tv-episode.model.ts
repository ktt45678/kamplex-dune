import { ShortDate } from '.';

export interface TVEpisode {
  _id: string;
  airDate: ShortDate;
  epNumber: number;
  runtime: number;
  name?: string;
  overview?: string;
  visibility: number;
  stillUrl?: string;
  thumbnailStillUrl?: string;
  smallStillUrl?: string;
  stillColor?: number;
  pStatus?: number;
  status: number;
}
