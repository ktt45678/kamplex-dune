import type { Media } from './media.model';
import type { TVEpisode } from './tv-episode.model';

export interface History {
  _id: string;
  media: Media;
  episode?: TVEpisode;
  time: number;
  date: string;
  paused: boolean;
  watched: boolean;
}
