import { Playlist, User } from '.';

export interface PlaylistDetails extends Playlist {
  author: Pick<User, AuthorProps>;
}

type AuthorProps = '_id'
  | 'username'
  | 'displayName'
  | 'avatarUrl'
  | 'thumbnailAvatarUrl'
  | 'smallAvatarUrl'
  | 'fullAvatarUrl'
  | 'avatarColor';
