import { Component, Input } from '@angular/core';

const TONE_BY_STATUS: Record<string, string> = {
  Approved: 'approved',
  'Maker-Approved': 'pending',
  Rejected: 'rejected',
  Returned: 'pending',
  Submitted: 'info',
  'Maker Review': 'pending',
  'Checker Review': 'pending',
  'In-Review': 'pending',
  'Pending Review': 'pending',
  Active: 'approved',
  Expired: 'rejected',
  Staged: 'info',
};

@Component({
  selector: 'app-status-badge',
  template: `<span class="csp-badge csp-badge--{{ tone }}">{{ icon }} {{ label || status }}</span>`,
})
export class StatusBadgeComponent {
  @Input() status = 'Submitted';
  @Input() label?: string;
  @Input() icon = '';

  get tone(): string {
    return TONE_BY_STATUS[this.status] ?? 'neutral';
  }
}
