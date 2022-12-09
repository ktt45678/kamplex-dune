import { CursorPagePlaylistItemsDto } from './cursor-page-playlist-items.dto';

export interface CursorPagePlaylistDto extends CursorPagePlaylistItemsDto {
  author?: string;
}
