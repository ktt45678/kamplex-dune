export interface FlixHQSearch {
  currentPage: number;
  hasNextPage: boolean;
  results: FlixHQSearchResult[];
}

export interface FlixHQSearchResult {
  id: string;
  title: string;
  url: string;
  image: string;
  type: 'Movie' | 'TV Series';
}
