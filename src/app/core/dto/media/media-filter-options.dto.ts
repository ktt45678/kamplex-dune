export interface MediaFilterOptionsDto {
  genres?: string[];
  tags?: string[];
  sort?: string | null;
  search?: string | null;
  type?: string | null;
  status?: string | null;
  originalLang?: string | null;
  year?: number | null;
}
