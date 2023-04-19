import { CursorPagePlaylistItemsDto } from './cursor-page-playlist-items.dto';

export interface CursorPagePlaylistsDto extends CursorPagePlaylistItemsDto {
  author?: string | null;
}
