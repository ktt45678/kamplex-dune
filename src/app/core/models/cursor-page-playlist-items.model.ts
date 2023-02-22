import { CursorPaginated, Media, PlaylistItem } from '.';

export interface CursorPagePlaylistItems extends CursorPaginated<Omit<PlaylistItem, 'media'> & NullablePartial<Pick<PlaylistItem, 'media'>>> {
  mediaList: Media[];
}
