import { ExtMediaResult } from '../ext-media-result.model';

export interface GogoanimeSearch {
  currentPage: number;
  hasNextPage: boolean;
  results: GogoanimeSearchResult[];
}

export interface GogoanimeSearchResult extends ExtMediaResult {
  url: string;
  releaseDate?: string;
  subOrDub: 'sub' | 'dub';
}
