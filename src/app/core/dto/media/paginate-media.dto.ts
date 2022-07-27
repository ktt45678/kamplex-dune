export interface PaginateMediaDto {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  genres?: string[];
  type?: string;
  status?: string;
  originalLanguage?: string;
  year?: number;
  includeHidden?: boolean;
  includeUnprocessed?: boolean;
}
