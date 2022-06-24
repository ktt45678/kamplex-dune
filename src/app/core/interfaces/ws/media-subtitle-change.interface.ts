import { MediaSubtitle } from '../../models';
import { MediaChange } from './media-change.interface';

export interface MediaSubtitleChange extends MediaChange {
  subtitles: MediaSubtitle[];
}
