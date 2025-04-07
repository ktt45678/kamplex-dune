import type { Playlist } from './playlist.model';

export interface PlaylistToAdd extends Pick<Playlist, PlaylistToAddProps> {
  hasMedia: boolean;
}

type PlaylistToAddProps = '_id'
  | 'name'
  | 'itemCount'
  | 'visibility'
  | 'createdAt';
