import { TestBed } from '@angular/core/testing';

import { UsersStateService } from './users-state.service';

describe('UsersStateService', () => {
  let service: UsersStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
