import type { Genre } from './genre.model';

export interface GenreDetails extends Genre {
  createdAt: Date;
  updatedAt: Date;
}
