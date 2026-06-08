import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { TenantRequest } from '../../../../models/kenar.model';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
})
export class RequestsComponent implements OnInit, OnDestroy {
  requests: TenantRequest[] = [];
  filteredRequests: TenantRequest[] = [];
  filterType: string = '';
  filterStatus: string = '';

  requestTypes = [
    'Contract Renewal',
    'Contract Termination',
    'Shop Maintenance',
    'Utility Bill Dispute',
    'Payment Clarification',
    'Document Update',
    'Shop Access Request',
    'Signage Approval',
    'Complaint',
    'General Inquiry',
  ];

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.requests$.subscribe((requests) => {
        this.requests = requests;
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter((request) => {
      const matchesType = !this.filterType || request.requestType === this.filterType;
      const matchesStatus = !this.filterStatus || request.status === this.filterStatus;

      return matchesType && matchesStatus;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterType = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      Submitted: 'woqod-badge-info',
      'Under Review': 'woqod-badge-warning',
      'In Progress': 'woqod-badge-warning',
      'Pending Tenant Action': 'woqod-badge-danger',
      'Pending WOQOD Approval': 'woqod-badge-info',
      Completed: 'woqod-badge-success',
      Rejected: 'woqod-badge-danger',
      Closed: 'woqod-badge-secondary',
    };
    return map[status] || 'woqod-badge-secondary';
  }

  getPriorityClass(priority: string): string {
    const map: { [key: string]: string } = {
      Low: 'text-success',
      Medium: 'text-info',
      High: 'text-warning',
      Urgent: 'text-danger',
    };
    return map[priority] || '';
  }

  submitNewRequest(): void {
    // TODO: Open request submission modal
    alert('Submit new request functionality will be implemented');
  }

  viewRequestDetails(request: TenantRequest): void {
    // TODO: Open request detail modal
    console.log('View request details:', request);
  }

  viewRequest(request: TenantRequest): void {
    this.viewRequestDetails(request);
  }
}
