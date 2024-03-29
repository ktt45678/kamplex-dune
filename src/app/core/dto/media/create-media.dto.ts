import { MediaExternalIds, MediaExternalStreams, MediaScannerData, ShortDate } from '../../models';

export interface CreateMediaDto {
  type: string;
  title: string;
  originalTitle: string | null;
  overview: string;
  genres: string[] | null;
  originalLang: string | null;
  studios: string[] | null;
  producers: string[] | null;
  tags: string[] | null;
  runtime: number;
  adult: boolean;
  releaseDate: ShortDate;
  lastAirDate?: ShortDate | null;
  visibility: number;
  status: string;
  externalIds?: NullablePartial<MediaExternalIds>;
  extStreams?: NullablePartial<MediaExternalStreams>;
  scanner?: MediaScannerData;
}
