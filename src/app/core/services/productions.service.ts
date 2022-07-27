import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { map } from 'rxjs';

import { CreateProductionDto, PaginateProductionsDto, UpdateProductionDto } from '../dto/productions';
import { Paginated, Production, ProductionDetails } from '../models';

@Injectable()
export class ProductionsService {

  constructor(private http: HttpClient, private translocoService: TranslocoService) { }

  create(createProductionDto: CreateProductionDto) {
    return this.http.post<ProductionDetails>('productions', createProductionDto);
  }

  findPage(paginateProductionsDto: PaginateProductionsDto) {
    const { page, limit, search, sort } = paginateProductionsDto;
    const params: any = {};
    page && (params['page'] = page);
    limit && (params['limit'] = limit);
    search && (params['search'] = search);
    sort && (params['sort'] = sort);
    return this.http.get<Paginated<Production>>('productions', { params });
  }

  findOne(id: string) {
    return this.http.get<ProductionDetails>(`productions/${id}`);
  }

  update(id: string, updateProductionDto: UpdateProductionDto) {
    return this.http.patch<ProductionDetails>(`productions/${id}`, updateProductionDto);
  }

  remove(id: string) {
    return this.http.delete(`productions/${id}`);
  }

  findProductionSuggestions(search?: string, limit = 10) {
    return this.findPage({ limit, search }).pipe(map(productions => {
      const productionSuggestions = productions.results;
      const hasMatch = productions.results.find(p => p.name === search);
      if (search && search.length <= 150 && !hasMatch) {
        const encodedName = encodeURIComponent(search);
        productionSuggestions.push({
          _id: `create:name=${encodedName}`,
          name: this.translocoService.translate('admin.createMedia.createProductionByName', { name: search })
        });
      }
      return productionSuggestions;
    }));
  }
}
