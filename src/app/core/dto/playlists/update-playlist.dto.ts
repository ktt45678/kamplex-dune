import { CreatePlaylistDto } from './create-playlist.dto';

export interface UpdatePlaylistDto extends Partial<CreatePlaylistDto> {
  thumbnailMedia: string;
}
