import type { Media } from './media.model';

export interface Playlist {
  _id: string;
  name: string;
  thumbnailUrl?: string;
  thumbnailThumbnailUrl?: string;
  smallThumbnailUrl?: string;
  fullThumbnailUrl?: string;
  thumbnailColor?: number;
  thumbnailPlaceholder?: string;
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
  | 'posterPlaceholder'
  | 'backdropUrl'
  | 'thumbnailBackdropUrl'
  | 'smallBackdropUrl'
  | 'fullBackdropUrl'
  | 'backdropColor'
  | 'backdropPlaceholder';
