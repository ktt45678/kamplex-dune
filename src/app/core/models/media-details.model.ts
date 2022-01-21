import { User, Media, Movie, TVShow, MediaVideo, Producer } from '.';

export class MediaDetails extends Media {
  producers!: Producer[];
  movie!: Movie;
  override tv!: TVShow;
  videos!: MediaVideo[];
  status!: number;
  visibility!: number;
  addedBy?: User;
}
