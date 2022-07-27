import { MediaSubtitle, TVEpisode } from '.';

export interface TVEpisodeDetails extends TVEpisode {
  subtitles: MediaSubtitle[];
}
