import { User, Media, Movie, TVShow, MediaVideo, Production } from '.';

export interface MediaDetails extends Media {
  productions: Production[];
  movie: Movie;
  tv: TVShow;
  videos: MediaVideo[];
  visibility: number;
  status: string;
  addedBy?: User;
}
