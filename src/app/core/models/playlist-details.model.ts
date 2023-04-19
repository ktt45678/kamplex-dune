import { Playlist, User } from '.';

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
  | 'avatarColor';
