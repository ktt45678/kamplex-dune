import { MediaStreamFile, MediaStreamSubtitle } from '.';

export interface MediaStream {
  streams: MediaStreamFile[];
  subtitles: MediaStreamSubtitle[];
}
