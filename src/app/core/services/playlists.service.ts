import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { AddPlaylistItemDto, CreatePlaylistDto, CursorPagePlaylistsDto, CursorPagePlaylistItemsDto, FindAddToPlaylistDto, UpdatePlaylistDto, DeletePlaylistItemDto, AddAllPlaylistItemsDto } from '../dto/playlists';
import { CursorPagePlaylistItems, CursorPaginated, Playlist, PlaylistDetails, PlaylistToAdd } from '../models';
import { getImageName } from '../utils';

@Injectable()
export class PlaylistsService {

  constructor(private http: HttpClient) { }

  create(createPlaylistDto: CreatePlaylistDto) {
    return this.http.post<PlaylistDetails>('playlists', createPlaylistDto);
  }

  findPage(cursorPageHistoryDto?: CursorPagePlaylistsDto) {
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

  uploadThumbnail(id: string, backdrop: File | Blob, name?: string) {
    if (!name)
      name = getImageName(backdrop);
    const data = new FormData();
    data.set('file', backdrop, name);
    return this.http.patch<PlaylistDetails>(`playlists/${id}/thumbnail`, data);
  }

  deleteThumbnail(id: string) {
    return this.http.delete(`playlists/${id}/thumbnail`);
  }

  findAddToPlaylist(findAddToPlaylistDto: FindAddToPlaylistDto) {
    const params: { [key: string]: any } = { mediaId: findAddToPlaylistDto.mediaId };
    findAddToPlaylistDto.search && (params['search'] = findAddToPlaylistDto.search);
    return this.http.get<PlaylistToAdd[]>('playlists/add_to_playlist', { params });
  }

  addToPlaylist(id: string, addPlaylistItemDto: AddPlaylistItemDto) {
    return this.http.post<PlaylistDetails>(`playlists/${id}/items`, addPlaylistItemDto);
  }

  addAllToPlaylist(id: string, addAllPlaylistItemsDto: AddAllPlaylistItemsDto) {
    return this.http.post(`playlists/${id}/all_items`, addAllPlaylistItemsDto);
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
        const mapMedia = data.mediaList.find(m => m._id === <string><unknown>result.media);
        if (mapMedia)
          result.media = mapMedia;
      });
      data.mediaList = [];
      return data;
    }));
  }

  removePlaylistItem(id: string, deletePlaylistItemDto: DeletePlaylistItemDto) {
    const params: { [key: string]: any } = {};
    const { itemId, mediaId } = deletePlaylistItemDto;
    itemId && (params['itemId'] = itemId);
    mediaId && (params['mediaId'] = mediaId);
    return this.http.delete(`playlists/${id}/items`, { params });
  }
}
