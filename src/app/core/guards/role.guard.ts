import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthRole } from '../../models/auth.model';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/** Restricts a route to specific roles via `data: { roles: [...] }`. */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const roles = route.data?.['roles'] as AuthRole[] | undefined;
    if (!roles || roles.length === 0 || this.auth.hasRole(roles)) return true;
    this.toast.error('You do not have permission to access that page.');
    return this.router.createUrlTree(['/csp/home']);
  }
}
