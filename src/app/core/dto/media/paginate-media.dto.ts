export interface PaginateMediaDto {
  genres?: string[];
  tags?: string[];
  genreMatch?: 'all' | 'any';
  tagMatch?: 'all' | 'any';
  excludeIds?: string | string[];
  type?: string;
  status?: string;
  originalLang?: string;
  year?: number;
  preset?: 'related';
  presetParams?: string | string[];
  includeHidden?: boolean;
  includeUnprocessed?: boolean;
}
