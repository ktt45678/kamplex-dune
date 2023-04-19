import {
  HistoryListOptions, HistoryOptions, MediaPlayerOptions, PlaylistListOptions, PlaylistOptions, RatingListOptions,
  RatingOptions, SubtitleOptions
} from '.';

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
