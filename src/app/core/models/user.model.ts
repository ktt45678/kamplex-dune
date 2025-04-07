import type { Role } from './role.model'

export interface User {
  _id: string;
  username: string;
  nickname?: string;
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
  avatarPlaceholder?: string;
}
