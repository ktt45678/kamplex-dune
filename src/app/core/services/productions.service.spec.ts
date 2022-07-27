import { TestBed } from '@angular/core/testing';

import { ProductionsService } from './productions.service';

describe('ProductionsService', () => {
  let service: ProductionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
