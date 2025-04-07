import type { LocalMediaPlayerOptions, LocalSubtitleOptions } from './local-player-settings-options.interface';

export interface LocalPlayerSettings {
  player?: LocalMediaPlayerOptions;
  subtitle?: LocalSubtitleOptions;
}
