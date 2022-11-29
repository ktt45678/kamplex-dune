import { ExtStreamList, MediaStreamFile, MediaStreamSubtitle, TVEpisodeDetails } from '.';

export interface MediaStream {
  _id: string;
  episode?: TVEpisodeDetails;
  streams: MediaStreamFile[];
  subtitles: MediaStreamSubtitle[];
  extStreamList: ExtStreamList;
}
