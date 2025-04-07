import type {
  HistoryListOptions, HistoryOptions, MediaPlayerOptions, PlaylistListOptions, PlaylistOptions, RatingListOptions,
  RatingOptions, SubtitleOptions
} from './user-settings-options.model';

export interface UserSettings {
  player: MediaPlayerOptions;
  subtitle: SubtitleOptions;
  history: HistoryOptions;
  playlist: PlaylistOptions;
  rating: RatingOptions;
  historyList: HistoryListOptions;
  playlistList: PlaylistListOptions;
  ratingList: RatingListOptions;
}
