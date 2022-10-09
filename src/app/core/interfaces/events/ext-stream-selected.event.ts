import { MediaExternalStreams } from '../../models';

export interface ExtStreamSelected {
  streams: Partial<MediaExternalStreams>;
  next: () => void;
  error: () => void;
}
