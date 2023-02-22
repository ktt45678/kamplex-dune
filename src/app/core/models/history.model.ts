import { Media, TVEpisode } from '.';

export interface History {
  _id: string;
  media: Media;
  episode?: TVEpisode;
  watchTime: number;
  date: string;
  paused: boolean;
}
