import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { SalesDataSummary, SalesData } from '../../../../models/kenar.model';

@Component({
  selector: 'app-sales-dashboard',
  templateUrl: './sales-dashboard.component.html',
  styleUrls: ['./sales-dashboard.component.scss'],
})
export class SalesDashboardComponent implements OnInit, OnDestroy {
  summary: SalesDataSummary | null = null;
  recentSales: SalesData[] = [];
  monthlySales: SalesData[] = [];

  private sub = new Subscription();

  constructor(
    private readonly kenarService: KenarService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.salesSummary$.subscribe((s) => (this.summary = s))
    );

    this.sub.add(
      this.kenarService.salesData$.subscribe((salesData) => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        this.recentSales = salesData
          .filter((s) => new Date(s.salesDate) >= sevenDaysAgo)
          .sort((a, b) => new Date(b.salesDate).getTime() - new Date(a.salesDate).getTime())
          .slice(0, 7);

        this.monthlySales = salesData
          .filter((s) => new Date(s.salesDate) >= thirtyDaysAgo)
          .sort((a, b) => new Date(b.salesDate).getTime() - new Date(a.salesDate).getTime());
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      'Processed Successfully': 'woqod-badge-success',
      'Pending Tenant Confirmation': 'woqod-badge-warning',
      'Confirmed by Tenant': 'woqod-badge-success',
      'Validation Failed': 'woqod-badge-danger',
      'Disputed by Tenant': 'woqod-badge-danger',
      'Received': 'woqod-badge-info',
      'Under Processing': 'woqod-badge-info',
      'Rejected': 'woqod-badge-secondary',
    };
    return map[status] || 'woqod-badge-secondary';
  }

  formatCurrency(amount: number): string {
    return `QAR ${amount.toLocaleString('en-QA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  navigateToSalesData(): void {
    this.router.navigate(['/kenar/sales-data']);
  }

  navigateToUpload(): void {
    this.router.navigate(['/kenar/sales-upload']);
  }

  navigateToReports(): void {
    this.router.navigate(['/kenar/sales-reports']);
  }
}
