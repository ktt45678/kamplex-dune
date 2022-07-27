import { MediaSubtitle } from './media-subtitle.model';

export interface Movie {
  status: number;
  subtitles: MediaSubtitle[];
}
