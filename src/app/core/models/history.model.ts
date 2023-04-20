import { Media, TVEpisode } from '.';

export interface History {
  _id: string;
  media: Media;
  episode?: TVEpisode;
  time: number;
  date: string;
  paused: boolean;
  watched: boolean;
}
