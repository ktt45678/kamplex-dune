import { ShortDate, TVEpisode, TVShowEpisodeCount } from '.';

export interface TVShow extends TVShowEpisodeCount {
  lastAirDate: ShortDate;
  episodes: TVEpisode[];
}
