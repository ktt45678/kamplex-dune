import type { SubtitleOptions } from '../../dto/users';

export interface LocalMediaPlayerOptions {
  muted?: boolean | null;
  volume?: number | null;
  audioGain?: number | null;
  audioTrack?: number | null;
  audioSurround?: boolean | null;
  quality?: number | null;
  speed?: number | null;
  subtitle?: boolean | null;
  subtitleLang?: string | null;
  autoNext?: boolean | null;
  prefAudioLang?: boolean;
  prefAudioLangList?: string[];
  prefSubtitleLang?: boolean;
  prefSubtitleLangList?: string[];
}

export interface LocalSubtitleOptions extends SubtitleOptions { }
