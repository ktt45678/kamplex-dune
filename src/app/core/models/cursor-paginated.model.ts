export interface CursorPaginated<T> {
  nextPageToken: string | null;
  prevPageToken: string | null;
  results: T[];
}
