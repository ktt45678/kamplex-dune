import type { TVEpisode } from './tv-episode.model';
import type { TVShowListInfo } from './tv-show-list-info.model';

export interface TVShow extends TVShowListInfo {
  episodes: TVEpisode[];
}
