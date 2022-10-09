import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { AddMediaSubtitleDto, AddMediaVideoDto, AddTVEpisodeDto, CreateMediaDto, FindOneMediaDto, FindTVEpisodesDto, PaginateMediaDto, UpdateMediaDto, UpdateMediaVideoDto, UpdateTVEpisodeDto } from '../dto/media';
import { ExtMediaSuggestions, FlixHQInfo, FlixHQSearch, GogoanimeInfo, GogoanimeSearch, Media, MediaDetails, MediaStream, MediaSubtitle, MediaVideo, Paginated, TVEpisode, TVEpisodeDetails, ZoroInfo, ZoroSearch } from '../models';
import { ExtMediaProvider } from '../../core/enums';
import { getImageName } from '../../core/utils';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MediaService {

  constructor(private http: HttpClient) { }

  create(createMediaDto: CreateMediaDto) {
    return this.http.post<MediaDetails>('media', createMediaDto);
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

  findOne(id: string, findOneMediaDto?: FindOneMediaDto) {
    const params: any = {};
    if (findOneMediaDto) {
      const { includeHiddenEps, includeUnprocessedEps } = findOneMediaDto;
      includeHiddenEps !== undefined && (params['includeHiddenEps'] = includeHiddenEps);
      includeUnprocessedEps !== undefined && (params['includeUnprocessedEps'] = includeUnprocessedEps);
    }
    return this.http.get<MediaDetails>(`media/${id}`, { params });
  }

  update(id: string, updateMediaDto: UpdateMediaDto) {
    return this.http.patch<MediaDetails>(`media/${id}`, updateMediaDto);
  }

  findMovieStreams(id: string) {
    return this.http.get<MediaStream>(`media/${id}/movie/streams`);
  }

  remove(id: string) {
    return this.http.delete<MediaDetails>(`media/${id}`);
  }

  uploadPoster(id: string, poster: File | Blob, name?: string) {
    if (!name)
      name = getImageName(poster);
    const data = new FormData();
    data.set('file', poster, name);
    return this.http.patch<MediaDetails>(`media/${id}/poster`, data);
  }

  deletePoster(id: string) {
    return this.http.delete(`media/${id}/poster`);
  }

  uploadBackdrop(id: string, backdrop: File | Blob, name?: string) {
    if (!name)
      name = getImageName(backdrop);
    const data = new FormData();
    data.set('file', backdrop, name);
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

  deleteMovieSource(id: string) {
    return this.http.delete(`media/${id}/movie/source`);
  }

  addTVEpisode(id: string, addTVEpisodeDto: AddTVEpisodeDto) {
    return this.http.post<TVEpisodeDetails>(`media/${id}/tv/episodes`, addTVEpisodeDto);
  }

  findAllTVEpisodes(id: string, findTVEpisodesDto: FindTVEpisodesDto) {
    const params: any = {};
    const { includeHidden, includeUnprocessed } = findTVEpisodesDto;
    includeHidden !== undefined && (params['includeHidden'] = includeHidden);
    includeUnprocessed !== undefined && (params['includeUnprocessed'] = includeUnprocessed);
    return this.http.get<TVEpisode[]>(`media/${id}/tv/episodes`, { params });
  }

  findOneTVEpisode(id: string, episodeId: string) {
    return this.http.get<TVEpisodeDetails>(`media/${id}/tv/episodes/${episodeId}`);
  }

  updateTVEpisode(id: string, episodeId: string, updateTVEpisodeDto: UpdateTVEpisodeDto) {
    return this.http.patch<TVEpisodeDetails>(`media/${id}/tv/episodes/${episodeId}`, updateTVEpisodeDto);
  }

  deleteTVEpisode(id: string, episodeId: string) {
    return this.http.delete(`media/${id}/tv/episodes/${episodeId}`);
  }

  uploadStill(id: string, episodeId: string, still: File | Blob, name?: string) {
    if (!name)
      name = getImageName(still);
    const data = new FormData();
    data.set('file', still, name);
    return this.http.patch<TVEpisodeDetails>(`media/${id}/tv/episodes/${episodeId}/still`, data);
  }

  deleteStill(id: string, episodeId: string) {
    return this.http.delete(`media/${id}/tv/episodes/${episodeId}/still`);
  }

  findAllTVSubtitles(id: string, episodeId: string) {
    return this.http.get<MediaSubtitle[]>(`media/${id}/tv/episodes/${episodeId}/subtitles`);
  }

  addTVSubtitle(id: string, episodeId: string, addMediaSubtitleDto: AddMediaSubtitleDto) {
    const data = new FormData();
    data.set('language', addMediaSubtitleDto.language);
    data.set('file', addMediaSubtitleDto.file);
    return this.http.post<MediaSubtitle[]>(`media/${id}/tv/episodes/${episodeId}/subtitles`, data);
  }

  deleteTVSubtitle(id: string, episodeId: string, subtitleId: string) {
    return this.http.delete(`media/${id}/tv/episodes/${episodeId}/subtitles/${subtitleId}`);
  }

  findTVStreams(id: string, episodeNumber: string | number) {
    return this.http.get<MediaStream>(`media/${id}/tv/episodes/${episodeNumber}/streams`);
  }

  deleteTVSource(id: string, episodeId: string) {
    return this.http.delete(`media/${id}/tv/episodes/${episodeId}/source`);
  }

  findExtMediaSuggestions(query: string, limit: number = 8) {
    const headers = { 'x-ng-intercept': 'http-error' };
    const requests: {
      flixHQ: Observable<FlixHQSearch>;
      zoro: Observable<ZoroSearch>;
      gogoanime: Observable<GogoanimeSearch>;
    } = {
      flixHQ: this.http.get<FlixHQSearch>(`${environment.consumetApiUrl}/movies/flixhq/${query}`, { headers }),
      zoro: this.http.get<ZoroSearch>(`${environment.consumetApiUrl}/anime/zoro/${query}`, { headers }),
      gogoanime: this.http.get<GogoanimeSearch>(`${environment.consumetApiUrl}/anime/gogoanime/${query}`, { headers })
    };
    return forkJoin(requests).pipe(map(responses => {
      const results: ExtMediaSuggestions[] = [];
      if (responses.flixHQ.results.length) {
        results.push({
          label: 'FlixHQ',
          value: ExtMediaProvider.FLIX_HQ,
          items: responses.flixHQ.results.slice(0, limit)
        });
      }
      if (responses.zoro.results.length) {
        results.push({
          label: 'Zoro',
          value: ExtMediaProvider.ZORO,
          items: responses.zoro.results.slice(0, limit)
        });
      }
      if (responses.gogoanime.results.length) {
        results.push({
          label: 'Gogoanime',
          value: ExtMediaProvider.GOGOANIME,
          items: responses.gogoanime.results.slice(0, limit)
        });
      }
      return results;
    }));
  }

  findFlixHQInfo(id: string) {
    return this.http.get<FlixHQInfo>(`${environment.consumetApiUrl}/movies/flixhq/info`,
      {
        headers: { 'x-ng-intercept': 'http-error' },
        params: { id }
      }
    ).pipe(map(media => {
      if (media.type === 'Movie')
        media.episodes = media.episodes.slice(0, 1);
      return media;
    }));
  }

  findZoroInfo(id: string) {
    return this.http.get<ZoroInfo>(`${environment.consumetApiUrl}/anime/zoro/info`,
      {
        headers: { 'x-ng-intercept': 'http-error' },
        params: { id }
      }
    );
  }

  findGogoanimeInfo(id: string) {
    return this.http.get<GogoanimeInfo>(`${environment.consumetApiUrl}/anime/gogoanime/info/${id}`,
      {
        headers: { 'x-ng-intercept': 'http-error' }
      }
    );
  }
}
