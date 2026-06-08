import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { Payment } from '../../../../models/kenar.model';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit, OnDestroy {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  filterMode: string = '';
  filterStatus: string = '';

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.payments$.subscribe((payments) => {
        this.payments = payments;
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  applyFilters(): void {
    this.filteredPayments = this.payments.filter((payment) => {
      const matchesMode = !this.filterMode || payment.paymentMode === this.filterMode;
      const matchesStatus = !this.filterStatus || payment.paymentStatus === this.filterStatus;

      return matchesMode && matchesStatus;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterMode = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      Completed: 'woqod-badge-success',
      Pending: 'woqod-badge-warning',
      Failed: 'woqod-badge-danger',
    };
    return map[status] || 'woqod-badge-secondary';
  }

  viewReceipt(payment: Payment): void {
    console.log('View receipt:', payment);
    // TODO: Open receipt modal
  }

  downloadReceipt(payment: Payment): void {
    console.log('Download receipt:', payment);
    // TODO: Implement receipt download
  }
}
