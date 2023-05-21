import { MediaState } from 'vidstack';

type PlayerStoreProps =
  'autoplayError' |
  'canPlay' |
  'waiting' |
  'playing' |
  'paused' |
  'muted' |
  'volume' |
  'fullscreen' |
  'canFullscreen' |
  'currentTime' |
  'error' |
  'loop' |
  'qualities' |
  'quality' |
  'autoQuality' |
  'canSetQuality' |
  'audioTracks' |
  'audioTrack' |
  'textTrack';

export type PlayerStore = Pick<MediaState, PlayerStoreProps>;
