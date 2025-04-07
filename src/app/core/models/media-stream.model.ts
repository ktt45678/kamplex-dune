import type { MediaStreamFile } from './media-stream-file.model';
import type { MediaStreamSubtitle } from './media-stream-subtitle.model';
import type { TVEpisodeDetails } from './tv-episode-details.model';

export interface MediaStream {
  _id: string;
  episode?: TVEpisodeDetails;
  baseUrl: string;
  streams: MediaStreamFile[];
  subtitles: MediaStreamSubtitle[];
  previewThumbnail: string;
}
