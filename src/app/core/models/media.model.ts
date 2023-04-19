import { Genre, MovieStatus, ShortDate, TVShowLastEpisode } from '.';

export interface Media {
  _id: string;
  type: string;
  title: string;
  originalTitle?: string;
  slug: string;
  overview: string;
  runtime: number;
  genres: Genre[];
  originalLang?: string;
  adult: boolean;
  releaseDate: ShortDate;
  movie: MovieStatus;
  tv: TVShowLastEpisode;
  views: number;
  dailyViews: number;
  weeklyViews: number;
  ratingCount: number;
  ratingAverage: number;
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
  pStatus?: number;
  createdAt: Date;
  updatedAt: Date;
  _translated?: boolean;
}
