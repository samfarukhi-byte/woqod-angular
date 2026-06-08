import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { ReportConfig } from '../../../../models/kenar.model';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit, OnDestroy {
  reports: ReportConfig[] = [];

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.reports = this.kenarService.getReportConfigs();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getReportIcon(reportType: string): string {
    const map: { [key: string]: string } = {
      'Statement of Account': '📊',
      'Rent Payment Report': '💰',
      'Outstanding Balance Report': '💳',
      'Utility Bill Report': '⚡',
      'Cheque Status Report': '🏦',
      'Shop List Report': '🏪',
      'Contract Summary Report': '📄',
      'Document Expiry Report': '📋',
      'Request History Report': '📝',
    };
    return map[reportType] || '📄';
  }

  downloadReport(report: ReportConfig): void {
    // TODO: Open report configuration modal or directly download
    alert(`Download report: ${report.reportName}\nAvailable filters: ${report.availableFilters.join(', ')}`);
  }
}
