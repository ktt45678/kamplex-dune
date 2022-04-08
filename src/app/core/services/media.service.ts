import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import * as UpChunk from '@mux/upchunk';

import { AddMediaSubtitleDto, AddMediaVideoDto, CreateMediaDto, PaginateMediaDto, UpdateMediaVideoDto } from '../dto/media';
import { Media, MediaDetails, MediaStream, MediaSubtitle, MediaVideo, Paginated } from '../models';

@Injectable()
export class MediaService {

  constructor(private http: HttpClient) { }

  create(createMediaDto: CreateMediaDto) {
    return this.http.post('media', createMediaDto);
  }

  findPage(paginateMediaDto?: PaginateMediaDto) {
    const params: any = {};
    if (paginateMediaDto) {
      const { page, limit, search, sort, genres, type, status, originalLanguage, year, includeHidden, includeUnprocessed } = paginateMediaDto;
      page && (params['page'] = page);
      limit && (params['limit'] = limit);
      search && (params['search'] = search);
      sort && (params['sort'] = sort);
      genres?.length && (params['genres'] = genres);
      type && (params['type'] = type);
      status && (params['status'] = status);
      originalLanguage && (params['originalLanguage'] = originalLanguage);
      year && (params['year'] = year);
      includeHidden && (params['includeHidden'] = includeHidden);
      includeUnprocessed && (params['includeUnprocessed'] = includeUnprocessed);
    }
    return this.http.get<Paginated<Media>>('media', { params });
  }

  findOne(id: string) {
    return this.http.get<MediaDetails>(`media/${id}`);
  }

  findMovieStreams(id: string) {
    return this.http.get<MediaStream>(`media/${id}/movie/streams`);
  }

  remove(id: string) {
    return this.http.delete<MediaDetails>(`media/${id}`);
  }

  uploadPoster(id: string, poster: File) {
    const data = new FormData();
    data.set('file', poster);
    return this.http.patch<MediaDetails>(`media/${id}/poster`, data);
  }

  deletePoster(id: string) {
    return this.http.delete(`media/${id}/poster`);
  }

  uploadBackdrop(id: string, backdrop: File) {
    const data = new FormData();
    data.set('file', backdrop);
    return this.http.patch<MediaDetails>(`media/${id}/backdrop`, data);
  }

  deleteBackdrop(id: string) {
    return this.http.delete(`media/${id}/backdrop`);
  }

  findAllVideos(id: string) {
    return this.http.get<MediaVideo[]>(`media/${id}/videos`);
  }

  addVideo(id: string, addMediaVideoDto: AddMediaVideoDto) {
    const { name, url } = addMediaVideoDto;
    return this.http.post<MediaVideo[]>(`media/${id}/videos`, { name, url });
  }

  updateVideo(id: string, videoId: string, updateMediaVideoDto: UpdateMediaVideoDto) {
    const { name, url, translate } = updateMediaVideoDto;
    return this.http.patch<MediaVideo[]>(`media/${id}/videos/${videoId}`, { name, url, translate });
  }

  deleteVideo(id: string, videoId: string) {
    return this.http.delete(`media/${id}/videos/${videoId}`);
  }

  findAllMovieSubtitles(id: string) {
    return this.http.get<MediaSubtitle[]>(`media/${id}/movie/subtitles`);
  }

  addMovieSubtitle(id: string, addMediaSubtitleDto: AddMediaSubtitleDto) {
    const data = new FormData();
    data.set('language', addMediaSubtitleDto.language);
    data.set('file', addMediaSubtitleDto.file);
    return this.http.post<MediaSubtitle[]>(`media/${id}/movie/subtitles`, data);
  }

  deleteMovieSubtitle(id: string, subtitleId: string) {
    return this.http.delete(`media/${id}/movie/subtitles/${subtitleId}`);
  }

  checkMediaStream(url: string) {
    return this.http.get(url, {
      headers: {
        'Range': 'bytes=0-500',
        'x-ng-intercept': 'ignore'
      }
    });
  }

  addMovieSource(id: string, file: File) {

  }

  deleteMovieSource(id: string) {
    return this.http.delete(`media/${id}/movie/source`);
  }
}
