import type { Media } from './media.model';

export interface PlaylistItem {
  _id: string;
  media: Media;
  addedAt: Date;
}
