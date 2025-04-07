import type { CursorPaginated } from './cursor-paginated.model';
import type { Media } from './media.model';
import type { PlaylistItem } from './playlist-item.model';

type NullablePartial<T> = { [P in keyof T]?: T[P] | null };

export interface CursorPagePlaylistItems extends CursorPaginated<Omit<PlaylistItem, 'media'> & NullablePartial<Pick<PlaylistItem, 'media'>>> {
  mediaList: Media[];
}
