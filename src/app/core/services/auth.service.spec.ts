import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: 'login', children: [] }])],
    });
    service = TestBed.inject(AuthService);
  });

  it('starts unauthenticated', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser).toBeNull();
  });

  it('logs in with valid demo credentials', () => {
    const res = service.login('customer', 'woqod123');
    expect(res.success).toBeTrue();
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser?.role).toBe('Customer');
  });

  it('rejects invalid credentials', () => {
    const res = service.login('customer', 'wrong');
    expect(res.success).toBeFalse();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('enforces roles via hasRole()', () => {
    service.login('maker', 'woqod123');
    expect(service.hasRole(['Maker', 'Admin'])).toBeTrue();
    expect(service.hasRole(['Checker'])).toBeFalse();
  });

  it('clears the session on logout', () => {
    service.login('admin', 'woqod123');
    expect(service.isAuthenticated()).toBeTrue();
    service.logout('manual');
    expect(service.isAuthenticated()).toBeFalse();
    expect(sessionStorage.getItem('woqod.auth')).toBeNull();
  });

  it('treats an expired session as unauthenticated', () => {
    service.login('customer', 'woqod123');
    service.currentUser!.expiresAt = Date.now() - 1000; // force-expire
    expect(service.isAuthenticated()).toBeFalse();
  });
});
