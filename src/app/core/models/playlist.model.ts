import { Media } from '.';

export interface Playlist {
  _id: string;
  name: string;
  thumbnailUrl?: string;
  thumbnailThumbnailUrl?: string;
  smallThumbnailUrl?: string;
  fullThumbnailUrl?: string;
  thumbnailColor?: number;
  thumbnailMedia?: Pick<Media, ThumbnailMediaProps>;
  itemCount: number;
  visibility: number;
  createdAt: string;
  updatedAt: string;
}

type ThumbnailMediaProps = '_id'
  | 'posterUrl'
  | 'thumbnailPosterUrl'
  | 'smallPosterUrl'
  | 'fullPosterUrl'
  | 'posterColor'
  | 'backdropUrl'
  | 'thumbnailBackdropUrl'
  | 'smallBackdropUrl'
  | 'fullBackdropUrl'
  | 'backdropColor';
