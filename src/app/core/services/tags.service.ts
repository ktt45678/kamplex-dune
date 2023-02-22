import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { map } from 'rxjs';

import { CreateTagDto, CursorPageMediaDto, CursorPageTagsDto, PaginateTagsDto, RemoveTagsDto, UpdateTagDto } from '../dto/tags';
import { FindSuggestionsOptions } from '../interfaces/options';
import { TagDetails, Paginated, Tag, CursorPaginated, Media } from '../models';

@Injectable({ providedIn: 'root' })
export class TagsService {
  constructor(private http: HttpClient, private translocoService: TranslocoService) { }

  create(createTagDto: CreateTagDto) {
    return this.http.post<TagDetails>('tags', createTagDto);
  }

  findPage(paginateTagsDto: PaginateTagsDto) {
    const { page, limit, search, sort } = paginateTagsDto;
    const params: any = {};
    page && (params['page'] = page);
    limit && (params['limit'] = limit);
    search && (params['search'] = search);
    sort && (params['sort'] = sort);
    return this.http.get<Paginated<Tag>>('tags', { params });
  }

  findPageCursor(cursorPageTagsDto: CursorPageTagsDto) {
    const { pageToken, limit, search, sort } = cursorPageTagsDto;
    const params: any = {};
    pageToken && (params['pageToken'] = pageToken);
    limit && (params['limit'] = limit);
    search && (params['search'] = search);
    sort && (params['sort'] = sort);
    return this.http.get<Paginated<Tag>>('tags/cursor', { params });
  }

  findOne(id: string) {
    return this.http.get<TagDetails>(`tags/${id}`);
  }

  update(id: string, updateTagDto: UpdateTagDto) {
    return this.http.patch<TagDetails>(`tags/${id}`, updateTagDto);
  }

  remove(id: string) {
    return this.http.delete(`tags/${id}`);
  }

  removeMany(removeTagsDto: RemoveTagsDto) {
    const { ids } = removeTagsDto;
    const params: any = { ids };
    return this.http.delete('tags', { params });
  }

  findAllMedia(id: string, cursorPageMediaDto: CursorPageMediaDto) {
    const { pageToken, limit, sort } = cursorPageMediaDto;
    const params: any = {};
    pageToken && (params['pageToken'] = pageToken);
    limit && (params['limit'] = limit);
    sort && (params['sort'] = sort);
    return this.http.get<CursorPaginated<Media>>(`tags/${id}/media`, { params });
  }

  findTagSuggestions(search?: string, options: FindSuggestionsOptions = {}) {
    options = Object.assign({}, { limit: 10, withCreateOption: true }, options);
    return this.findPage({ limit: options.limit, search, sort: 'asc(name)' }).pipe(map(tags => {
      const tagSuggestions = tags.results;
      if (options.withCreateOption) {
        const hasMatch = tags.results.find(g => g.name === search);
        if (search && search.length <= 32 && !hasMatch) {
          const encodedName = encodeURIComponent(search);
          tagSuggestions.push({
            _id: `create:name=${encodedName}`,
            name: this.translocoService.translate('admin.createMedia.createTagByName', { name: search })
          });
        }
      }
      return tagSuggestions;
    }));
  }
}
