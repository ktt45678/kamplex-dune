import { MediaSubtitle } from './media-subtitle.model';
import { TVEpisode } from './tv-episode.model';

export class TVEpisodeDetails extends TVEpisode {
  subtitles!: MediaSubtitle[];
}
