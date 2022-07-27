import { Genre, MovieStatus, ShortDate, TVShowEpisodeCount } from '.';

export interface Media {
  _id: string;
  type: string;
  title: string;
  originalTitle?: string;
  slug: string;
  overview: string;
  runtime: number;
  genres: Genre[];
  originalLanguage?: string;
  adult: boolean;
  releaseDate: ShortDate;
  movie: MovieStatus;
  tv: TVShowEpisodeCount;
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
  pStatus: number;
  createdAt: Date;
  updatedAt: Date;
  _translated?: boolean;
}
