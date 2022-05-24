import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { map } from 'rxjs';

import { CreateGenreDto, PaginateGenresDto, UpdateGenreDto } from '../dto/genres';
import { Genre, GenreDetails, Paginated } from '../models';

@Injectable()
export class GenresService {
  constructor(private http: HttpClient, private translocoService: TranslocoService) { }

  create(createGenreDto: CreateGenreDto) {
    return this.http.post<GenreDetails>('genres', createGenreDto);
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
    return this.http.get<Genre[]>('genres/all', { params });
  }

  findOne(id: string) {
    return this.http.get<GenreDetails>(`genres/${id}`);
  }

  update(id: string, updateGenreDto: UpdateGenreDto) {
    return this.http.patch<GenreDetails>(`genres/${id}`, updateGenreDto);
  }

  remove(id: string) {
    return this.http.delete(`genres/${id}`);
  }

  findGenreSuggestions(search?: string, limit = 10) {
    return this.findPage({ limit, search }).pipe(map(genres => {
      const genreSuggestions = genres.results;
      const hasMatch = genres.results.find(g => g.name === search);
      if (search && search.length <= 32 && !hasMatch) {
        genreSuggestions.push({
          _id: `create:${search}`,
          name: this.translocoService.translate('admin.createMedia.createGenreByName', { name: search })
        });
      }
      return genreSuggestions;
    }));
  }
}
