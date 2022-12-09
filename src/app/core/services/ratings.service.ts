import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CreateRatingDto, FindRatedMediaDto } from '../dto/ratings';
import { Rating } from '../models';

@Injectable()
export class RatingsService {
  constructor(private http: HttpClient) { }

  create(createRatingDto: CreateRatingDto) {
    return this.http.post<Rating>('ratings', createRatingDto);
  }

  remove(id: string) {
    return this.http.delete<Rating>(`ratings/${id}`);
  }

  findMedia(findRatedMediaDto: FindRatedMediaDto) {
    return this.http.get<Rating | null>('ratings/find_media', { params: <{ [key: string]: any }>findRatedMediaDto });
  }
}
