import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Media, MediaDetails, MediaStream, Paginated } from '../models';

@Injectable()
export class MediaService {

  constructor(private http: HttpClient) { }

  findAll() {
    return this.http.get<Paginated<Media>>('media');
  }

  findOne(id: string) {
    return this.http.get<MediaDetails>(`media/${id}`);
  }

  findMovieStreams(id: string) {
    return this.http.get<MediaStream>(`media/${id}/movie/streams`);
  }
}
