import type { User } from './user.model';
import type { Media } from './media.model';
import type { Movie } from './movie.model';
import type { TVShow } from './tv-show.model';
import type { MediaVideo } from './media-video.model';
import type { Production } from './production.model';
import type { MediaExternalIds } from './media-external-ids.model';
import type { MediaExternalStreams } from './media-external-streams.model';
import type { MediaScannerData } from './media-scanner-data.model';
import type { MediaCollection } from './media-collection.model';
import type { Tag } from './tag.model';

export interface MediaDetails extends Media {
  studios: Production[];
  producers: Production[];
  tags: Tag[];
  movie: Movie;
  tv: TVShow;
  videos: MediaVideo[];
  ratingScore: number;
  visibility: number;
  status: string;
  inCollections?: MediaCollection[];
  externalIds: MediaExternalIds;
  externalStreams?: MediaExternalStreams;
  scanner?: MediaScannerData;
  addedBy?: User;
}
