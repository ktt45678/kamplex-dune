export interface PaginateMediaDto {
  genres?: string[];
  tags?: string[];
  type?: string;
  status?: string;
  originalLang?: string;
  year?: number;
  includeHidden?: boolean;
  includeUnprocessed?: boolean;
}
