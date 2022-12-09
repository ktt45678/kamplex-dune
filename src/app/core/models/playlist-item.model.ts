import { Media } from '.';

export interface PlaylistItem {
  _id: string;
  media: Media;
  addedAt: Date;
}
