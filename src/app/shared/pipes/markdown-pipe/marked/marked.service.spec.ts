import { TestBed } from '@angular/core/testing';

import { MarkedService } from './marked.service';

describe('MarkedService', () => {
  let service: MarkedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
