import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { AddPlaylistItemDto, CreatePlaylistDto, CursorPagePlaylistDto, CursorPagePlaylistItemsDto, FindAddToPlaylistDto, UpdatePlaylistDto } from '../dto/playlists';
import { CursorPagePlaylistItems, CursorPaginated, Playlist, PlaylistDetails, PlaylistToAdd } from '../models';

@Injectable()
export class PlaylistsService {

  constructor(private http: HttpClient) { }

  create(createPlaylistDto: CreatePlaylistDto) {
    return this.http.post<Playlist>('playlists', createPlaylistDto);
  }

  findPage(cursorPageHistoryDto?: CursorPagePlaylistDto) {
    const params: { [key: string]: any } = {};
    if (cursorPageHistoryDto) {
      const { pageToken, limit, sort, author } = cursorPageHistoryDto;
      pageToken && (params['pageToken'] = pageToken);
      limit && (params['limit'] = limit);
      sort && (params['sort'] = sort);
      author && (params['author'] = author);
    }
    return this.http.get<CursorPaginated<Playlist>>('playlists', { params });
  }

  findOne(id: string) {
    return this.http.get<PlaylistDetails>(`playlists/${id}`);
  }

  update(id: string, updatePlaylistDto: UpdatePlaylistDto) {
    return this.http.patch<PlaylistDetails>(`playlists/${id}`, updatePlaylistDto);
  }

  remove(id: string) {
    return this.http.delete(`playlists/${id}`);
  }

  findAddToPlaylist(findAddToPlaylistDto: FindAddToPlaylistDto) {
    return this.http.get<PlaylistToAdd[]>('playlists/add_to_playlist', { params: { mediaId: findAddToPlaylistDto.mediaId } });
  }

  addToPlaylist(id: string, addPlaylistItemDto: AddPlaylistItemDto) {
    return this.http.post<PlaylistDetails>(`playlists/${id}/items`, addPlaylistItemDto);
  }

  findPageItems(id: string, cursorPagePlaylistItemsDto: CursorPagePlaylistItemsDto) {
    const params: { [key: string]: any } = {};
    if (cursorPagePlaylistItemsDto) {
      const { pageToken, limit, sort } = cursorPagePlaylistItemsDto;
      pageToken && (params['pageToken'] = pageToken);
      limit && (params['limit'] = limit);
      sort && (params['sort'] = sort);
    }
    return this.http.get<CursorPagePlaylistItems>(`playlists/${id}/items`, { params }).pipe(map(data => {
      data.results.forEach(result => {
        const mapMedia = data.mediaList.find(m => m._id === <string><unknown>result.media) || null;
        result.media = mapMedia;
      });
      data.mediaList = [];
      return data;
    }));
  }

  removePlaylistItem(id: string, itemId: string) {
    return this.http.delete(`playlists/${id}/items/${itemId}`);
  }
}
