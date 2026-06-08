import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { DashboardSummary, RentInvoice, Cheque, ContractAlert, TenantRequest, TenantNotification } from '../../../../models/kenar.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  summary: DashboardSummary | null = null;
  recentInvoices: RentInvoice[] = [];
  upcomingCheques: Cheque[] = [];
  contractAlerts: ContractAlert[] = [];
  recentRequests: TenantRequest[] = [];
  recentNotifications: TenantNotification[] = [];

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.dashboardSummary$.subscribe((s) => (this.summary = s))
    );

    this.sub.add(
      this.kenarService.invoices$.subscribe((invoices) => {
        this.recentInvoices = invoices.slice(0, 5);
      })
    );

    this.sub.add(
      this.kenarService.cheques$.subscribe((cheques) => {
        this.upcomingCheques = cheques
          .filter((c) => c.status === 'Submitted' || c.status === 'Pending Deposit')
          .slice(0, 5);
      })
    );

    this.contractAlerts = this.kenarService.getContractAlerts();

    this.sub.add(
      this.kenarService.requests$.subscribe((requests) => {
        this.recentRequests = requests
          .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
          .slice(0, 5);
      })
    );

    this.sub.add(
      this.kenarService.notifications$.subscribe((notifications) => {
        this.recentNotifications = notifications
          .filter((n) => !n.isRead)
          .slice(0, 5);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      Paid: 'csp-badge-success',
      Pending: 'csp-badge-warning',
      Overdue: 'csp-badge-danger',
      'Partially Paid': 'csp-badge-info',
      Active: 'csp-badge-success',
      'Expiring Soon': 'csp-badge-warning',
      Submitted: 'csp-badge-info',
      'In Progress': 'csp-badge-warning',
      Completed: 'csp-badge-success',
    };
    return map[status] || 'csp-badge-secondary';
  }
}
