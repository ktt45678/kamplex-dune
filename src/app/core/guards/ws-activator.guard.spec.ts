import { TestBed } from '@angular/core/testing';

import { WsActivatorGuard } from './ws-activator.guard';

describe('WsActivatorGuard', () => {
  let guard: WsActivatorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(WsActivatorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
