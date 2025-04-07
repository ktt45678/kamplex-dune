import type { Playlist } from './playlist.model';
import type { User } from './user.model';

export interface PlaylistDetails extends Playlist {
  description: string;
  author: Pick<User, AuthorProps>;
}

type AuthorProps = '_id'
  | 'username'
  | 'nickname'
  | 'avatarUrl'
  | 'thumbnailAvatarUrl'
  | 'smallAvatarUrl'
  | 'fullAvatarUrl'
  | 'avatarColor'
  | 'avatarPlaceholder';
