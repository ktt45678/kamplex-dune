import { TestBed } from '@angular/core/testing';

import { ConfirmDeactivateGuard } from './confirm-deactivate.guard';

describe('ConfirmDeactivateGuard', () => {
  let guard: ConfirmDeactivateGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ConfirmDeactivateGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
