import { ShortDate } from '../../models';

export class AddTVEpisodeDto {
  episodeNumber!: number;
  name?: string;
  overview?: string;
  runtime!: number;
  airDate!: ShortDate;
  visibility!: number;
}
