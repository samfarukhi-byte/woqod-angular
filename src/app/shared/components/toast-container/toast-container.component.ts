import { Component } from '@angular/core';
import { Toast, ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="woqod-toasts" aria-live="polite" aria-atomic="true">
      <div *ngFor="let t of toast.toasts$ | async"
           class="woqod-toast"
           [ngClass]="'woqod-toast--' + t.type"
           role="status">
        <span class="woqod-toast__icon">{{ icon(t) }}</span>
        <span class="woqod-toast__text">{{ t.text }}</span>
        <button class="woqod-toast__close" type="button" (click)="toast.dismiss(t.id)" aria-label="Dismiss">✕</button>
      </div>
    </div>
  `,
  styles: [':host { display: contents; }'],
})
export class ToastContainerComponent {
  constructor(public readonly toast: ToastService) {}

  icon(t: Toast): string {
    return t.type === 'success' ? '✓' : t.type === 'error' ? '⚠️' : t.type === 'warning' ? '⚠' : 'ℹ️';
  }
}
