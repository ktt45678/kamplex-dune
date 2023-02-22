import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CreateRatingDto, CursorPageRatingsDto, FindRatedMediaDto } from '../dto/ratings';
import { CursorPaginated, Rating, RatingDetails } from '../models';

@Injectable()
export class RatingsService {
  constructor(private http: HttpClient) { }

  create(createRatingDto: CreateRatingDto) {
    return this.http.post<Rating>('ratings', createRatingDto);
  }

  findPage(cursorPageRatingsDto?: CursorPageRatingsDto) {
    const params: { [key: string]: any } = {};
    if (cursorPageRatingsDto) {
      const { pageToken, limit, user } = cursorPageRatingsDto;
      pageToken && (params['pageToken'] = pageToken);
      limit && (params['limit'] = limit);
      user && (params['user'] = user);
    }
    return this.http.get<CursorPaginated<RatingDetails>>('ratings', { params });
  }

  remove(id: string) {
    return this.http.delete(`ratings/${id}`);
  }

  findMedia(findRatedMediaDto: FindRatedMediaDto) {
    return this.http.get<Rating | null>('ratings/find_media', { params: <{ [key: string]: any }>findRatedMediaDto });
  }
}
