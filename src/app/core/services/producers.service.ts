import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CreateProducerDto, PaginateProducersDto, UpdateProducerDto } from '../dto/producers';
import { Paginated, Producer, ProducerDetails } from '../models';

@Injectable()
export class ProducersService {

  constructor(private http: HttpClient) { }

  create(createProducerDto: CreateProducerDto) {
    return this.http.post<ProducerDetails>('producers', createProducerDto);
  }

  findPage(paginateProducersDto: PaginateProducersDto) {
    const { page, limit, search, sort } = paginateProducersDto;
    const params: any = {};
    page && (params['page'] = page);
    limit && (params['limit'] = limit);
    search && (params['search'] = search);
    sort && (params['sort'] = sort);
    return this.http.get<Paginated<Producer>>('producers', { params });
  }

  findOne(id: string) {
    return this.http.get<ProducerDetails>(`producers/${id}`);
  }

  update(id: string, updateProducerDto: UpdateProducerDto) {
    return this.http.patch<ProducerDetails>(`producers/${id}`, updateProducerDto);
  }

  remove(id: string) {
    return this.http.delete(`producers/${id}`);
  }
}
