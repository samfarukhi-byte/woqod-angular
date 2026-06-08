import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface Toast { id: number; type: ToastType; text: string; }

/** Central, app-wide toast/notification service (success / error / info / warning). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private readonly _toasts$ = new BehaviorSubject<Toast[]>([]);
  readonly toasts$: Observable<Toast[]> = this._toasts$.asObservable();

  show(type: ToastType, text: string, ms = 4000): void {
    const toast: Toast = { id: ++this.seq, type, text };
    this._toasts$.next([...this._toasts$.value, toast]);
    if (ms > 0) setTimeout(() => this.dismiss(toast.id), ms);
  }

  success(text: string): void { this.show('success', text); }
  error(text: string): void { this.show('error', text, 6000); }
  info(text: string): void { this.show('info', text); }
  warning(text: string): void { this.show('warning', text, 5000); }

  dismiss(id: number): void {
    this._toasts$.next(this._toasts$.value.filter((t) => t.id !== id));
  }
}
