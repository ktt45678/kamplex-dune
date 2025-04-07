export interface FindOneMediaDto {
  includeHiddenEps?: boolean;
  includeUnprocessedEps?: boolean;
  includeHiddenMedia?: boolean;
  includeUnprocessedMedia?: boolean;
  appendToResponse?: string;
}
