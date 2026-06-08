import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CspRequest } from '../../../../models/request.model';

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styles: [':host { display: block; }'],
})
export class RequestCardComponent {
  @Input() request!: CspRequest;
  @Output() viewDetails = new EventEmitter<CspRequest>();
  @Output() resubmit = new EventEmitter<CspRequest>();

  badgeClass(): string {
    const s = this.request.status;
    if (s === 'Approved') return 'csp-badge--approved';
    if (s === 'Rejected') return 'csp-badge--rejected';
    if (s === 'Returned' || s === 'Maker Review' || s === 'Maker-Approved' || s === 'Checker Review') return 'csp-badge--pending';
    return 'csp-badge--info';
  }

  badgeIcon(): string {
    const s = this.request.status;
    if (s === 'Approved') return '✓';
    if (s === 'Rejected') return '✗';
    if (s === 'Returned') return '↩';
    return '⏳';
  }

  cardModClass(): string {
    const s = this.request.status;
    if (s === 'Approved') return 'csp-request-card--success';
    if (s === 'Rejected') return 'csp-request-card--error';
    if (s === 'Returned') return 'csp-request-card--warning';
    return '';
  }

  formatDate(iso?: string | null): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return iso; }
  }
}
