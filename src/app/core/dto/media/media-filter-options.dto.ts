export interface MediaFilterOptionsDto {
  genres?: string[];
  sort?: string | null;
  search?: string;
  type?: string | null;
  status?: string | null;
  originalLanguage?: string | null;
  year?: number | null;
}
