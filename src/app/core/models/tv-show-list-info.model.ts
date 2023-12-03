import { ShortDate } from './short-date.model';
import { TVEpisode } from './tv-episode.model';

export interface TVShowListInfo {
  lastAirDate?: ShortDate;
  lastEpisode?: TVEpisode;
  pLastEpisode?: TVEpisode;
}
