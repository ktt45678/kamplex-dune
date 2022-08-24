import { ExtMediaEpisode } from '../ext-media-episode.model';
import { ExtMediaInfo } from '../ext-media-info.model';

export interface ZoroInfo extends ExtMediaInfo {
  description?: string;
  type?: string;
  totalEpisodes?: number;
  episodes: ZoroEpisode[];
}

export interface ZoroEpisode extends ExtMediaEpisode {
  title?: string;
  isFiller: boolean;
}
