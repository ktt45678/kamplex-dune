import { ExtMediaEpisode } from '../ext-media-episode.model';
import { ExtMediaInfo } from '../ext-media-info.model';

export interface GogoanimeInfo extends ExtMediaInfo {
  genres: string[];
  totalEpisodes: number;
  releaseDate?: string;
  description?: string;
  subOrDub: 'sub' | 'dub';
  type?: string;
  status: 'Ongoing' | 'Completed' | 'Not yet aired' | 'Unknown';
  otherName?: string;
  episodes: GogoanimeEpisode[];
}

export interface GogoanimeEpisode extends ExtMediaEpisode { }
