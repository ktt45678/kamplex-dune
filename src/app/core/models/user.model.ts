import { Role } from '.'

export class User {
  _id!: string;
  username!: string;
  displayName?: string;
  roles!: Role[];
  banned!: boolean;
  owner?: boolean;
  lastActiveAt!: string;
  createdAt!: string;
  avatarUrl?: string;
  avatarThumbnailUrl?: string;
  avatarColor?: number;
  thumbnailAvatarUrl?: string;
}
