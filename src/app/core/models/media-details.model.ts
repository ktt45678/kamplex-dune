import { User, Media, Movie, TVShow, MediaVideo, Producer } from '.';

export interface MediaDetails extends Media {
  producers: Producer[];
  movie: Movie;
  tv: TVShow;
  videos: MediaVideo[];
  visibility: number;
  status: string;
  addedBy?: User;
}
