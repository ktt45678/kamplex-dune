import type { MediaExternalStreams } from './media-external-streams.model';
import type { MediaSubtitle } from './media-subtitle.model';

export interface Movie {
  status: number;
  subtitles: MediaSubtitle[];
  extStreams: MediaExternalStreams;
}
