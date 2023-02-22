import { Media, Rating } from '.';

export interface RatingDetails extends Rating {
  media: Media;
}
