import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthRole, AuthUser } from '../../models/auth.model';

const STORAGE_KEY = 'woqod.auth';
const SESSION_MS = 30 * 60 * 1000; // 30-minute sliding session

interface DemoUser {
  username: string;
  password: string;
  name: string;
  role: AuthRole;
  email: string;
}

/**
 * Front-end authentication for the prototype.
 * NOTE (security): credentials and tokens here are mock/in-browser only. In production,
 * authentication must be server-side (OAuth2/OIDC), tokens delivered in httpOnly+Secure
 * cookies, and all authorization enforced on the API — guards here are defense-in-depth only.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user$ = new BehaviorSubject<AuthUser | null>(this.restore());
  readonly user$: Observable<AuthUser | null> = this._user$.asObservable();

  /** Demo account — the portal is customer-only. */
  readonly demoUsers: DemoUser[] = [
    { username: 'customer', password: 'woqod123', name: 'Sagar Marthin', role: 'Customer', email: 'sagar.m@woqod.com.qa' },
  ];

  constructor(private readonly router: Router) {
    this.setupActivityWatch();
  }

  get currentUser(): AuthUser | null { return this._user$.value; }

  /**
   * First authentication factor: validate the username + password WITHOUT creating
   * a session. A session is only established once the OTP is verified (see `login`).
   */
  verifyCredentials(username: string, password: string): { success: boolean; message?: string } {
    const match = this.demoUsers.find(
      (d) => d.username.toLowerCase() === username.trim().toLowerCase() && d.password === password
    );
    return match ? { success: true } : { success: false, message: 'Invalid username or password.' };
  }

  login(username: string, password: string): { success: boolean; message?: string } {
    const match = this.demoUsers.find(
      (d) => d.username.toLowerCase() === username.trim().toLowerCase() && d.password === password
    );
    if (!match) return { success: false, message: 'Invalid username or password.' };

    const user: AuthUser = {
      username: match.username,
      name: match.name,
      role: match.role,
      email: match.email,
      token: this.makeToken(),
      expiresAt: Date.now() + SESSION_MS,
    };
    this.persist(user);
    this._user$.next(user);
    return { success: true };
  }

  logout(reason: 'manual' | 'expired' = 'manual'): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this._user$.next(null);
    this.router.navigate(['/login'], reason === 'expired' ? { queryParams: { reason: 'expired' } } : {});
  }

  isAuthenticated(): boolean {
    const u = this._user$.value;
    return !!u && u.expiresAt > Date.now();
  }

  hasRole(roles: AuthRole[]): boolean {
    const u = this._user$.value;
    return !!u && roles.includes(u.role);
  }

  /** Extend the sliding session (called on user activity). */
  touch(): void {
    const u = this._user$.value;
    if (!u) return;
    u.expiresAt = Date.now() + SESSION_MS;
    this.persist(u);
  }

  // ---- internals ----------------------------------------------------------
  private persist(user: AuthUser): void {
    // sessionStorage (not localStorage) so the token does not survive tab close.
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  private restore(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const u = JSON.parse(raw) as AuthUser;
      if (!u?.expiresAt || u.expiresAt <= Date.now()) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return u;
    } catch {
      return null;
    }
  }

  private makeToken(): string {
    return 'tok_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  private setupActivityWatch(): void {
    let last = 0;
    const onActivity = () => {
      const now = Date.now();
      if (this.isAuthenticated() && now - last > 15000) {
        last = now;
        this.touch();
      }
    };
    ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach((ev) =>
      document.addEventListener(ev, onActivity, { passive: true })
    );
    // Expiry sweep
    setInterval(() => {
      const u = this._user$.value;
      if (u && u.expiresAt <= Date.now()) this.logout('expired');
    }, 30000);
  }
}
