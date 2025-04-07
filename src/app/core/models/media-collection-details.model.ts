import type { MediaCollection } from './media-collection.model';
import type { Media } from './media.model';

export interface MediaCollectionDetails extends MediaCollection {
  overview: string;
  media: Media[];
}
