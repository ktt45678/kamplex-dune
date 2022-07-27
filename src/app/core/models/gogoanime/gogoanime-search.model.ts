export interface GogoanimeSearch {
  currentPage: number;
  hasNextPage: boolean;
  results: GogoanimeSearchResult[];
}

export interface GogoanimeSearchResult {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate?: string;
  subOrDub: 'sub' | 'dub';
}
