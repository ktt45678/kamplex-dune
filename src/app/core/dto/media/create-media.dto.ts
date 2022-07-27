import { ShortDate } from '../../models';

export interface CreateMediaDto {
  type: string;
  title: string;
  originalTitle: string | null;
  overview: string;
  genres: string[] | null;
  originalLanguage: string | null;
  productions: string[] | null;
  runtime: number;
  adult: boolean;
  releaseDate: ShortDate;
  lastAirDate?: ShortDate;
  visibility: number;
  status: string;
}
