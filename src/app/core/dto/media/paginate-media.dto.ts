export interface PaginateMediaDto {
  genres?: string[];
  tags?: string[];
  type?: string;
  status?: string;
  originalLanguage?: string;
  year?: number;
  includeHidden?: boolean;
  includeUnprocessed?: boolean;
}
