import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ShopDetail } from '../../../../models/kenar.model';
import { KenarService } from '../../../../core/services/kenar.service';

@Component({
  selector: 'app-shop-detail-modal',
  templateUrl: './shop-detail-modal.component.html',
  styleUrls: ['./shop-detail-modal.component.scss'],
})
export class ShopDetailModalComponent implements OnChanges {
  @Input() shopId: string | null = null;
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  shopDetail: ShopDetail | null = null;

  constructor(private kenarService: KenarService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shopId'] && this.shopId) {
      this.shopDetail = this.kenarService.getShopDetails(this.shopId);
    }
  }

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
    const status = this.shopDetail?.contractStatus ?? '';
    if (status === 'Active') return 'csp-badge--approved';
    if (status === 'Expiring Soon') return 'csp-badge--pending';
    if (status === 'Expired' || status === 'Terminated') return 'csp-badge--rejected';
    return 'csp-badge--info';
  }

  operationalBadgeClass(): string {
    const status = this.shopDetail?.operationalStatus ?? '';
    if (status === 'Operational') return 'csp-badge--approved';
    if (status === 'Under Maintenance') return 'csp-badge--pending';
    if (status === 'Closed') return 'csp-badge--rejected';
    return 'csp-badge--info';
  }
}
