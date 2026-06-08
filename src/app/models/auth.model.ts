export type AuthRole = 'Customer' | 'Maker' | 'Checker' | 'Admin';

export interface AuthUser {
  username: string;
  name: string;
  role: AuthRole;
  email: string;
  /** Opaque session token (mock). In production this is a server-issued JWT in an httpOnly cookie. */
  token: string;
  /** Epoch ms at which the session expires (refreshed on activity). */
  expiresAt: number;
}
