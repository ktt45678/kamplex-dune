import { ExtMediaResult } from '../ext-media-result.model';

export interface FlixHQSearch {
  currentPage: number;
  hasNextPage: boolean;
  results: FlixHQSearchResult[];
}

export interface FlixHQSearchResult extends ExtMediaResult {
  url: string;
  type: 'Movie' | 'TV Series';
}
