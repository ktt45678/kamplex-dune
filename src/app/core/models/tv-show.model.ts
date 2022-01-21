import { TVEpisode, TVShowEpisodeCount } from '.';

export class TVShow extends TVShowEpisodeCount {
  lastAirDate!: string;
  episodes!: TVEpisode[];
}
