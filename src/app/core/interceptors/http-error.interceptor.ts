import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/** Central HTTP error handling → friendly, branded toast + 401 auto sign-out. */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private readonly toast: ToastService, private readonly auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        let message = 'Something went wrong. Please try again.';
        if (err.status === 0) message = 'Network error — please check your connection.';
        else if (err.status === 401) { message = 'Your session has expired. Please sign in again.'; this.auth.logout('expired'); }
        else if (err.status === 403) message = 'You are not authorized to perform this action.';
        else if (err.status === 404) message = 'The requested resource was not found.';
        else if (err.status === 422) message = 'Please check the information you entered.';
        else if (err.status >= 500) message = 'Server error. Please try again shortly.';
        else if (err.error?.message) message = err.error.message;
        this.toast.error(message);
        return throwError(() => err);
      })
    );
  }
}
