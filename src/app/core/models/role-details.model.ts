import type { Role } from './role.model';

export interface RoleDetails extends Role {
  createdAt: string;
  updatedAt: string;
}
