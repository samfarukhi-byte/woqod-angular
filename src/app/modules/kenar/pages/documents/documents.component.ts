import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { TenantDocument } from '../../../../models/kenar.model';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit, OnDestroy {
  documents: TenantDocument[] = [];
  filteredDocuments: TenantDocument[] = [];
  filterType: string = '';
  filterStatus: string = '';

  documentTypes = [
    'Commercial Registration',
    'Trade License',
    'Computer Card',
    'QID Copy',
    'Insurance Certificate',
    'Municipality License',
    'Civil Defense Approval',
    'Food Safety Approval',
    'Signed Lease Agreement',
    'Security Deposit Proof',
    'Cheque Copies',
    'Authorization Letters',
    'Other',
  ];

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.documents$.subscribe((documents) => {
        this.documents = documents;
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  applyFilters(): void {
    this.filteredDocuments = this.documents.filter((doc) => {
      const matchesType = !this.filterType || doc.documentType === this.filterType;
      const matchesStatus = !this.filterStatus || doc.status === this.filterStatus;

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
      Approved: 'woqod-badge-success',
      Rejected: 'woqod-badge-danger',
      Expired: 'woqod-badge-danger',
      'Renewal Required': 'woqod-badge-warning',
    };
    return map[status] || 'woqod-badge-secondary';
  }

  viewDocument(doc: TenantDocument): void {
    // TODO: Open document viewer/preview modal
    console.log('View document:', doc);
    alert(`View document ${doc.documentName}`);
  }

  uploadDocument(): void {
    // TODO: Open upload document modal
    console.log('Upload document');
    alert('Upload document functionality will be implemented');
  }

  downloadDocument(doc: TenantDocument): void {
    // TODO: Implement document download
    console.log('Download document:', doc);
    alert(`Download document ${doc.documentName}`);
  }
}
