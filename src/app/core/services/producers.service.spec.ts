import { TestBed } from '@angular/core/testing';

import { ProducersService } from './producers.service';

describe('ProducersService', () => {
  let service: ProducersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProducersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
