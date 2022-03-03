import { TestBed } from '@angular/core/testing';

import { PermissionPipeService } from './permission-pipe.service';

describe('PermissionPipeService', () => {
  let service: PermissionPipeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionPipeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
