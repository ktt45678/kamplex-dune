import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpCacheManager, withCache } from '@ngneat/cashew';
import { TranslocoService } from '@ngneat/transloco';
import { map, tap } from 'rxjs';

import { CreateGenreDto, PaginateGenresDto, UpdateGenreDto } from '../dto/genres';
import { Genre, GenreDetails, Paginated } from '../models';
import { CacheKey } from '../enums';

@Injectable({ providedIn: 'root' })
export class GenresService {
  constructor(private http: HttpClient, private translocoService: TranslocoService, private httpCacheManager: HttpCacheManager) { }

  create(createGenreDto: CreateGenreDto) {
    return this.http.post<GenreDetails>('genres', createGenreDto).pipe(tap(() => {
      this.invalidateAllGenresCache();
    }));
  }

  findPage(paginateGenresDto: PaginateGenresDto) {
    const { page, limit, search, sort } = paginateGenresDto;
    const params: any = {};
    page && (params['page'] = page);
    limit && (params['limit'] = limit);
    search && (params['search'] = search);
    sort && (params['sort'] = sort);
    return this.http.get<Paginated<Genre>>('genres', { params });
  }

  findAll(sort?: string) {
    const params: any = {};
    sort && (params['sort'] = sort);
    return this.http.get<Genre[]>('genres/all', {
      params,
      context: withCache({
        key: CacheKey.ALL_GENRES
      })
    });
  }

  findOne(id: string) {
    return this.http.get<GenreDetails>(`genres/${id}`);
  }

  update(id: string, updateGenreDto: UpdateGenreDto) {
    return this.http.patch<GenreDetails>(`genres/${id}`, updateGenreDto).pipe(tap(() => {
      this.invalidateAllGenresCache();
    }));
  }

  remove(id: string) {
    return this.http.delete(`genres/${id}`).pipe(tap(() => {
      this.invalidateAllGenresCache();
    }));
  }

  findGenreSuggestions(search?: string, limit = 10) {
    return this.findPage({ limit, search }).pipe(map(genres => {
      const genreSuggestions = genres.results;
      const hasMatch = genres.results.find(g => g.name === search);
      if (search && search.length <= 32 && !hasMatch) {
        const encodedName = encodeURIComponent(search);
        genreSuggestions.push({
          _id: `create:name=${encodedName}`,
          name: this.translocoService.translate('admin.createMedia.createGenreByName', { name: search })
        });
      }
      return genreSuggestions;
    }));
  }

  invalidateAllGenresCache() {
    this.httpCacheManager.delete(CacheKey.ALL_GENRES);
  }
}
