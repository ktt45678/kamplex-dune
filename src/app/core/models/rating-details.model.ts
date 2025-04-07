import type { Media } from './media.model';
import type { Rating } from './rating.model';

export interface RatingDetails extends Rating {
  media: Media;
}
