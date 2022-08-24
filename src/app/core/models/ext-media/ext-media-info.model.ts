import { ExtMediaEpisode } from './ext-media-episode.model';

export interface ExtMediaInfo {
  id: string;
  title: string;
  url: string;
  image: string;
  episodes: ExtMediaEpisode[];
}
