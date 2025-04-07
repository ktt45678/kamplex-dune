import type { Tag } from './tag.model';

export interface TagDetails extends Tag {
  createdAt: Date;
  updatedAt: Date;
}
