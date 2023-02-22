import { ShortDate, TVEpisode, TVShowLastEpisode } from '.';

export interface TVShow extends TVShowLastEpisode {
  lastAirDate: ShortDate;
  episodes: TVEpisode[];
}
