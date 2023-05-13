import { MediaState } from 'vidstack';

type PlayerStoreProps =
  'canPlay' |
  'waiting' |
  'playing' |
  'paused' |
  'muted' |
  'volume' |
  'fullscreen' |
  'canFullscreen' |
  'currentTime';

type PlayerStoreQualityProps =
  'qualities' |
  'quality' |
  'autoQuality' |
  'canSetQuality';

type PlayerStoreAudioProps =
  'audioTracks' |
  'audioTrack';

export type PlayerStore = Pick<Readonly<MediaState>, PlayerStoreProps>;
export type PlayerStoreQuality = Pick<Readonly<MediaState>, PlayerStoreQualityProps>;
export type PlayerStoreAudio = Pick<Readonly<MediaState>, PlayerStoreAudioProps>;
