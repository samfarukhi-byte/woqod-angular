import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CspRequest } from '../../../../models/request.model';

const DOC_LABELS: Record<string, string> = {
  CR_COPY: 'CR Copy',
  BANK_GUARANTEE: 'Bank Guarantee',
  VAT_CERT: 'VAT Certificate',
  OTHER: 'Other Documents',
};

@Component({
  selector: 'app-request-modal',
  templateUrl: './request-modal.component.html',
  styles: [
    `:host { display: block; }`,
    `.csp-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1049; }`,
    `.csp-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1050; width: min(640px, 94vw); max-height: 86vh; overflow-y: auto; background: #fff; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); display: flex; flex-direction: column; }`,
  ],
})
export class RequestModalComponent {
  @Input() request: CspRequest | null = null;
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() resubmit = new EventEmitter<CspRequest>();

  badgeClass(): string {
    const s = this.request?.status ?? '';
    if (s === 'Approved') return 'csp-badge--approved';
    if (s === 'Rejected') return 'csp-badge--rejected';
    if (s === 'Returned' || s === 'Maker Review' || s === 'Maker-Approved' || s === 'Checker Review') return 'csp-badge--pending';
    return 'csp-badge--info';
  }

  badgeIcon(): string {
    const s = this.request?.status ?? '';
    if (s === 'Approved') return '✓';
    if (s === 'Rejected') return '✗';
    if (s === 'Returned') return '↩';
    return '⏳';
  }

  isResubmittable(): boolean {
    return this.request?.status === 'Rejected' || this.request?.status === 'Returned';
  }

  documentKeys(): string[] {
    return Object.keys(this.request?.documents ?? {});
  }

  docLabel(code: string): string {
    return DOC_LABELS[code] ?? code;
  }

  formatBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  }

  formatDateTime(iso?: string | null): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  }
}
