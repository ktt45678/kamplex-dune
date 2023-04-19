export interface MediaPlayerOptions {
  autoNextEp?: boolean;
}

export interface SubtitleOptions {
  fontSize?: number;
  fontFamily?: string | null;
  fontWeight?: string | null;
  textColor?: number | null;
  textAlpha?: number | null;
  textEdge?: number | null;
  bgColor?: number | null;
  bgAlpha?: number | null;
  winColor?: number | null;
  winAlpha?: number | null;
}

export interface HistoryOptions {
  limit?: number;
  paused?: boolean;
}

export interface PlaylistOptions {
  visibility: number;
  recentId?: string;
}

export interface RatingOptions {

}

export interface HistoryListOptions {
  view?: number;
  visibility: number;
}

export interface PlaylistListOptions {
  view?: number;
}

export interface RatingListOptions {
  view?: number;
  editMode?: boolean;
  visibility: number;
}
