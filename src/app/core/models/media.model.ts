import { Genre } from '.';

export class Media {
  _id!: string;
  type!: string;
  title!: string;
  originalTitle?: string;
  slug!: string;
  overview!: string;
  runtime!: number;
  genres!: Genre[];
  originalLanguage?: string;
  adult!: boolean;
  episodeCount?: number;
  releaseDate!: string;
  views!: number;
  ratingCount!: number;
  ratingAverage!: number;
  posterUrl?: string;
  thumbnailPosterUrl?: string;
  smallPosterUrl?: string;
  posterColor?: number;
  backdropUrl?: string;
  thumbnailBackdropUrl?: string;
  smallBackdropUrl?: string;
  backdropColor?: number;
  createdAt!: Date;
  updatedAt!: Date;
  _translated?: boolean;
}
