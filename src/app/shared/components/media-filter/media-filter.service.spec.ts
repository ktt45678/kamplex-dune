import { TestBed } from '@angular/core/testing';

import { MediaFilterService } from './media-filter.service';

describe('MediaFilterService', () => {
  let service: MediaFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
