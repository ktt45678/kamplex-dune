import type { MediaState } from 'vidstack';

type PlayerStoreProps =
  'autoPlayError' |
  'canPlay' |
  'waiting' |
  'playing' |
  'paused' |
  'muted' |
  'volume' |
  'audioGain' |
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
