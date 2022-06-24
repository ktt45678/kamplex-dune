import { MediaVideo } from '../../models';
import { MediaChange } from './media-change.interface';

export interface MediaVideoChange extends MediaChange {
  videos: MediaVideo[];
}
