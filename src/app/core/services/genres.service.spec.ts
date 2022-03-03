import { TestBed } from '@angular/core/testing';

import { GenresService } from './genres.service';

describe('GenresService', () => {
  let service: GenresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
