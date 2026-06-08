import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { SalesData, SalesDataStatus, Shop } from '../../../../models/kenar.model';

@Component({
  selector: 'app-sales-data',
  templateUrl: './sales-data.component.html',
  styleUrls: ['./sales-data.component.scss'],
})
export class SalesDataComponent implements OnInit, OnDestroy {
  salesData: SalesData[] = [];
  filteredSales: SalesData[] = [];
  shops: Shop[] = [];

  filterStartDate: string = '';
  filterEndDate: string = '';
  filterShop: string = '';
  filterStatus: string = '';

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.salesData$.subscribe((data) => {
        this.salesData = data;
        this.applyFilters();
      })
    );

    this.sub.add(
      this.kenarService.shops$.subscribe((shops) => {
        this.shops = shops;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  applyFilters(): void {
    this.filteredSales = this.salesData.filter((sale) => {
      const saleDate = new Date(sale.salesDate);
      const matchesShop = !this.filterShop || sale.shopCode === this.filterShop;
      const matchesStatus = !this.filterStatus || sale.processingStatus === this.filterStatus;

      let matchesDateRange = true;
      if (this.filterStartDate) {
        matchesDateRange = saleDate >= new Date(this.filterStartDate);
      }
      if (this.filterEndDate && matchesDateRange) {
        matchesDateRange = saleDate <= new Date(this.filterEndDate);
      }

      return matchesShop && matchesStatus && matchesDateRange;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterShop = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  confirmSales(salesId: string): void {
    // TODO: Implement sales confirmation
    console.log('Confirm sales:', salesId);
    alert(`Sales data ${salesId} confirmed`);
  }

  disputeSales(salesId: string): void {
    // TODO: Implement sales dispute
    console.log('Dispute sales:', salesId);
    const reason = prompt('Please provide reason for dispute:');
    if (reason) {
      alert(`Sales data ${salesId} disputed. Reason: ${reason}`);
    }
  }

  downloadSalesRecord(salesId: string): void {
    // TODO: Implement sales record download
    console.log('Download sales record:', salesId);
    alert(`Download sales record ${salesId}`);
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

  getDataSourceIcon(source: string): string {
    const iconMap: { [key: string]: string } = {
      'API Integration': '🔗',
      'File Upload': '📁',
      'Manual Entry': '✏️',
    };
    return iconMap[source] || '📄';
  }
}
