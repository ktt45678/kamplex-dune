import { Role } from '.'

export interface User {
  _id: string;
  username: string;
  displayName?: string;
  roles: Role[];
  banned: boolean;
  owner?: boolean;
  lastActiveAt: string;
  createdAt: string;
  avatarUrl?: string;
  thumbnailAvatarUrl?: string;
  smallAvatarUrl?: string;
  fullAvatarUrl?: string;
  avatarColor?: number;
}
