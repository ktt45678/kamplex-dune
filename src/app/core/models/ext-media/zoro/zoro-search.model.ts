import { ExtMediaResult } from '../ext-media-result.model';

export interface ZoroSearch {
  currentPage: number;
  hasNextPage: boolean;
  results: ZoroSearchResult[];
}

export interface ZoroSearchResult extends ExtMediaResult {
  type: string;
  url: string;
}
