import { MediaExternalStreams, MediaSubtitle } from '.';

export interface Movie {
  status: number;
  subtitles: MediaSubtitle[];
  extStreams: MediaExternalStreams;
}
