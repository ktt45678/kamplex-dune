export interface CursorPageHistoryDto {
  pageToken?: string;
  limit?: number;
  startDate?: string | null;
  endDate?: string | null;
  mediaIds?: string | string[];
  mediaType?: string | null;
  mediaOriginalLanguage?: string | null;
  mediaYear?: number | null;
  mediaAdult?: boolean | null;
  mediaGenres?: string | string[];
}
