import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { Shop } from '../../../../models/kenar.model';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-sales-reports',
  templateUrl: './sales-reports.component.html',
  styleUrls: ['./sales-reports.component.scss'],
})
export class SalesReportsComponent implements OnInit, OnDestroy {
  shops: Shop[] = [];

  reportTypes: ReportType[] = [
    {
      id: 'daily',
      name: 'Daily Sales Report',
      description: 'Detailed breakdown of sales for a specific day',
      icon: 'calendar',
    },
    {
      id: 'monthly',
      name: 'Monthly Sales Report',
      description: 'Comprehensive monthly sales summary and trends',
      icon: 'bar-chart',
    },
    {
      id: 'annual',
      name: 'Annual Sales Report',
      description: 'Year-over-year sales performance and analysis',
      icon: 'trending-up',
    },
    {
      id: 'payment-method',
      name: 'Payment Method Analysis',
      description: 'Breakdown of sales by payment method (Cash, Card, Wallet)',
      icon: 'credit-card',
    },
    {
      id: 'sales-trend',
      name: 'Sales Trend Analysis',
      description: 'Historical trends and forecasting insights',
      icon: 'activity',
    },
    {
      id: 'comparative',
      name: 'Comparative Sales Report',
      description: 'Compare sales across multiple shops and periods',
      icon: 'git-compare',
    },
  ];

  selectedReport: string = '';
  filterStartDate: string = '';
  filterEndDate: string = '';
  filterShop: string = '';

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.shops$.subscribe((shops) => {
        this.shops = shops;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  generateReport(reportType: string): void {
    if (!this.filterStartDate || !this.filterEndDate) {
      alert('Please select a date range for the report');
      return;
    }

    const report = this.reportTypes.find((r) => r.id === reportType);
    console.log('Generating report:', reportType, {
      startDate: this.filterStartDate,
      endDate: this.filterEndDate,
      shop: this.filterShop,
    });

    // TODO: Implement actual report generation
    alert(`Generating ${report?.name}...\n\nDate Range: ${this.filterStartDate} to ${this.filterEndDate}\nShop: ${this.filterShop || 'All Shops'}`);
  }

  downloadReport(): void {
    if (!this.selectedReport) {
      alert('Please select a report type');
      return;
    }

    this.generateReport(this.selectedReport);
  }

  clearFilters(): void {
    this.selectedReport = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterShop = '';
  }

  getReportIcon(iconName: string): string {
    // Return SVG icon based on icon name
    const icons: { [key: string]: string } = {
      calendar: 'M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z M16 2V6 M8 2V6 M3 10H21',
      'bar-chart': 'M12 20V10 M18 20V4 M6 20V16',
      'trending-up': 'M23 6L13.5 15.5L8.5 10.5L1 18 M17 6H23V12',
      'credit-card': 'M1 4H23V20H1V4Z M1 10H23',
      'activity': 'M22 12H18L15 21L9 3L6 12H2',
      'git-compare': 'M18 13V19 M18 19C18 20.1046 17.1046 21 16 21C14.8954 21 14 20.1046 14 19C14 17.8954 14.8954 17 16 17C17.1046 17 18 17.8954 18 19Z M6 5V11 M6 5C6 6.10457 6.89543 7 8 7C9.10457 7 10 6.10457 10 5C10 3.89543 9.10457 3 8 3C6.89543 3 6 3.89543 6 5Z M18 5L14 9L10 5 M6 19L10 15L14 19',
    };
    return icons[iconName] || icons['calendar'];
  }
}
