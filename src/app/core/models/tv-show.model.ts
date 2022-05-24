import { ShortDate, TVEpisode, TVShowEpisodeCount } from '.';

export class TVShow extends TVShowEpisodeCount {
  lastAirDate!: ShortDate;
  episodes!: TVEpisode[];
}
