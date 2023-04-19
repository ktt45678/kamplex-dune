import {
  MediaPlayerOptions, SubtitleOptions, HistoryOptions, PlaylistOptions, HistoryListOptions, PlaylistListOptions,
  RatingListOptions
} from './user-settings-options.dto';

export interface UpdateUserSettingsDto {
  player?: MediaPlayerOptions;
  subtitle?: SubtitleOptions;
  history?: HistoryOptions;
  playlist?: PlaylistOptions;
  historyList?: HistoryListOptions;
  playlistList?: PlaylistListOptions;
  ratingList?: RatingListOptions;
}
