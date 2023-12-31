import { TestBed } from '@angular/core/testing';

import { RouterLoaderService } from './router-loader.service';

describe('RouterLoaderService', () => {
  let service: RouterLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouterLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
