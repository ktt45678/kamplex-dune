import { TVEpisode, TVShowListInfo } from '.';

export interface TVShow extends TVShowListInfo {
  episodes: TVEpisode[];
}
