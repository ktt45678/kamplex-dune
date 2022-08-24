import { ExtMediaEpisode } from '../ext-media-episode.model';
import { ExtMediaInfo } from '../ext-media-info.model';

export interface FlixHQInfo extends ExtMediaInfo {
  description: string;
  type: 'Movie' | 'TV Series';
  releaseDate?: string;
  genres: string[];
  casts?: string[];
  tags?: string[];
  production?: string;
  duration?: string;
  rating: number;
  episodes: FlixHQEpisode[];
}

export interface FlixHQEpisode extends ExtMediaEpisode {
  title: string;
  season?: number;
}
