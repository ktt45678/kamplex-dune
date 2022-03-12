import { TestBed } from '@angular/core/testing';

import { QueueUploadService } from './queue-upload.service';

describe('QueueUploadService', () => {
  let service: QueueUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueueUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
