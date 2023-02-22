import { User, Media, Movie, TVShow, MediaVideo, Production, MediaExternalIds, MediaExternalStreams, MediaScannerData, Tag } from '.';

export interface MediaDetails extends Media {
  productions: Production[];
  tags: Tag[];
  movie: Movie;
  tv: TVShow;
  videos: MediaVideo[];
  ratingScore: number;
  visibility: number;
  status: string;
  externalIds: MediaExternalIds;
  externalStreams?: MediaExternalStreams;
  scanner?: MediaScannerData;
  addedBy?: User;
}
