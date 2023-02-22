export interface MediaFilterOptionsDto {
  genres?: string[];
  tags?: string[];
  sort?: string | null;
  search?: string | null;
  type?: string | null;
  status?: string | null;
  originalLanguage?: string | null;
  year?: number | null;
}
