import { TestBed } from '@angular/core/testing';

import { UnloadGuard } from './unload.guard';

describe('UnloadGuard', () => {
  let guard: UnloadGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UnloadGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
