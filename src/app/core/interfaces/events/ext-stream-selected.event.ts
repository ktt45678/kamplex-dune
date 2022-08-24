import { MediaExternalStreams } from '../../models';

export interface ExtStreamSelected {
  streams: Partial<MediaExternalStreams>;
  complete: () => void;
}
