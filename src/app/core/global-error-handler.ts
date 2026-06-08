import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ToastService } from './services/toast.service';

/** Catches uncaught client-side errors → logs + surfaces a friendly toast. */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private readonly injector: Injector) {}

  handleError(error: unknown): void {
    // eslint-disable-next-line no-console
    console.error('[WOQOD] Unhandled error:', error);
    try {
      this.injector.get(ToastService).error('An unexpected error occurred. Please try again.');
    } catch {
      /* toast unavailable during bootstrap — ignore */
    }
  }
}
