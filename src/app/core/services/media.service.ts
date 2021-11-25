import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Media, Paginated } from '../models';

@Injectable()
export class MediaService {

  constructor(private http: HttpClient) { }

  findAll() {
    return this.http.get<Paginated<Media>>('media');
  }
}
