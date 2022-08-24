import { MediaSubtitle, MediaExternalStreams, TVEpisode } from '.';

export interface TVEpisodeDetails extends TVEpisode {
  subtitles: MediaSubtitle[];
  extStreams: MediaExternalStreams;
}
