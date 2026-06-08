import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Contract } from '../../../../models/kenar.model';

@Component({
  selector: 'app-contract-detail-modal',
  templateUrl: './contract-detail-modal.component.html',
  styleUrls: ['./contract-detail-modal.component.scss'],
})
export class ContractDetailModalComponent {
  @Input() contract: Contract | null = null;
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  formatCurrency(value: number): string {
    return `QAR ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  statusBadgeClass(): string {
    const status = this.contract?.contractStatus ?? '';
    if (status === 'Active') return 'csp-badge--approved';
    if (status === 'Expiring Soon' || status === 'Renewal Pending') return 'csp-badge--pending';
    if (status === 'Expired' || status === 'Terminated') return 'csp-badge--rejected';
    return 'csp-badge--info';
  }

  downloadContract(): void {
    // Placeholder for contract download
    console.log('Download contract:', this.contract?.contractNumber);
    // TODO: Implement actual download when API is available
  }

  calculateContractDuration(): string {
    if (!this.contract) return '—';
    try {
      const start = new Date(this.contract.startDate);
      const end = new Date(this.contract.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      return `${diffYears.toFixed(1)} years`;
    } catch {
      return '—';
    }
  }
}
