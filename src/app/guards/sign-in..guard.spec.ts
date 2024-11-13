import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { signInGuard } from './sign-in..guard';

describe('signInGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => signInGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
