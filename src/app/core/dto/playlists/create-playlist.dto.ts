export interface CreatePlaylistDto {
  name: string;
  description?: string | null;
  visibility: number;
  mediaId?: string;
}
