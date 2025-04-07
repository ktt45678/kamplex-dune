import type { ShortDate } from './short-date.model';
import type { TVEpisode } from './tv-episode.model';

export interface TVShowListInfo {
  lastAirDate?: ShortDate;
  lastEpisode?: TVEpisode;
  pLastEpisode?: TVEpisode;
}
