import { ShortDate } from '.';

export class TVEpisode {
  airDate!: ShortDate;
  episodeNumber!: number;
  runtime!: number;
  name?: string;
  overview?: string;
  visibility!: number;
  stillUrl?: string;
  thumbnailStillUrl?: string;
  smallStillUrl?: string;
  stillColor?: number;
}
