import { Genre, MovieStatus, ShortDate, TVShowListInfo } from '.';

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
  tv: TVShowListInfo;
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
  posterPlaceholder?: string;
  backdropUrl?: string;
  thumbnailBackdropUrl?: string;
  smallBackdropUrl?: string;
  fullBackdropUrl?: string;
  backdropColor?: number;
  backdropPlaceholder?: string;
  pStatus?: number;
  createdAt: Date;
  updatedAt: Date;
  _translated?: boolean;
}
