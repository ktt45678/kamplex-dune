import { TestBed } from '@angular/core/testing';

import { RatingsService } from './ratings.service';

describe('RatingsService', () => {
  let service: RatingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RatingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
