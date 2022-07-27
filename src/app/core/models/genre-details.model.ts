import { Genre } from '.';

export interface GenreDetails extends Genre {
  createdAt: Date;
  updatedAt: Date;
}
