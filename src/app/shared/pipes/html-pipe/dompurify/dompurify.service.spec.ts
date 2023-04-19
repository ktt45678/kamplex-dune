import { TestBed } from '@angular/core/testing';

import { DompurifyService } from './dompurify.service';

describe('DompurifyService', () => {
  let service: DompurifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DompurifyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
