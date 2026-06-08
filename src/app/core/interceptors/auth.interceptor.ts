import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Attaches the session token to outgoing API requests (ready for a real backend). */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const user = this.auth.currentUser;
    if (user?.token && req.url.startsWith('/')) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${user.token}` } });
    }
    return next.handle(req);
  }
}
