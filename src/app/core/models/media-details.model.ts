import { User, Media, Movie, TVShow, MediaVideo, Production, MediaExternalIds, MediaExternalStreams, MediaScannerData } from '.';

export interface MediaDetails extends Media {
  productions: Production[];
  movie: Movie;
  tv: TVShow;
  videos: MediaVideo[];
  visibility: number;
  status: string;
  externalIds: MediaExternalIds;
  externalStreams?: MediaExternalStreams;
  scanner?: MediaScannerData;
  addedBy?: User;
}
