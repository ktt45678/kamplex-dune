import { ShortDate } from '.';

export interface TVEpisode {
  _id: string;
  airDate: ShortDate;
  episodeNumber: number;
  runtime: number;
  name?: string;
  overview?: string;
  visibility: number;
  stillUrl?: string;
  thumbnailStillUrl?: string;
  smallStillUrl?: string;
  stillColor?: number;
  status: number;
}
