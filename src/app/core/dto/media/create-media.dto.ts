import { ShortDate } from '../../models';

export class CreateMediaDto {
  type!: string;
  title!: string;
  originalTitle?: string;
  overview!: string;
  genres?: string[];
  originalLanguage?: string;
  producers?: string[];
  runtime!: number;
  adult!: boolean;
  releaseDate!: ShortDate;
  lastAirDate?: ShortDate;
  visibility!: number;
  status!: string;
}
