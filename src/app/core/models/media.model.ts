import { Genre, ShortDate, TVShowEpisodeCount } from '.';

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
  releaseDate!: ShortDate;
  tv!: TVShowEpisodeCount;
  views!: number;
  dailyViews!: number;
  weeklyViews!: number;
  ratingCount!: number;
  ratingAverage!: number;
  posterUrl?: string;
  thumbnailPosterUrl?: string;
  smallPosterUrl?: string;
  fullPosterUrl?: string;
  posterColor?: number;
  backdropUrl?: string;
  thumbnailBackdropUrl?: string;
  smallBackdropUrl?: string;
  fullBackdropUrl?: string;
  backdropColor?: number;
  createdAt!: Date;
  updatedAt!: Date;
  _translated?: boolean;
}
