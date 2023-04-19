import { MediaExternalStreams, ShortDate } from '../../models';

export interface AddTVEpisodeDto {
  epNumber: number;
  name?: string;
  overview?: string;
  runtime: number;
  airDate: ShortDate;
  visibility: number;
  extStreams?: Partial<MediaExternalStreams>;
}
