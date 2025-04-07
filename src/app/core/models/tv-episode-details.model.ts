import type { MediaSubtitle } from './media-subtitle.model';
import type { MediaExternalStreams } from './media-external-streams.model';
import type { TVEpisode } from './tv-episode.model';

export interface TVEpisodeDetails extends TVEpisode {
  subtitles: MediaSubtitle[];
  extStreams: MediaExternalStreams;
}
