import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CreateGenreDto, PaginateGenresDto, UpdateGenreDto } from '../dto/genres';
import { Genre, GenreDetails, Paginated } from '../models';

@Injectable()
export class GenresService {
  constructor(private http: HttpClient) { }

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
}
