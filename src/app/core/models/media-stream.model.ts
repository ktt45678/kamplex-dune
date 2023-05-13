import { MediaStreamFile, MediaStreamSubtitle, TVEpisodeDetails } from '.';

export interface MediaStream {
  _id: string;
  episode?: TVEpisodeDetails;
  baseUrl: string;
  streams: MediaStreamFile[];
  subtitles: MediaStreamSubtitle[];
  previewThumbnail: string;
}
