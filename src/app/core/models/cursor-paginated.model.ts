export interface CursorPaginated<T> {
  hasNextPage: boolean;
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults: number;
  results: T[];
}
