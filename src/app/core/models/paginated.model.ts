export interface Paginated<T> {
  totalPages: number;
  totalResults: number;
  page: number;
  results: T[];
}
