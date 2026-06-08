import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CspService } from '../../../../core/services/csp.service';
import { BulkFuelService, BulkFuelApplication } from '../../../../core/services/bulk-fuel.service';
import { Customer } from '../../../../models/customer.model';
import { ApprovalTrailEntry, CspRequest, RequestStatus } from '../../../../models/request.model';

interface StatusMeta { tone: string; badge: string; cardMod: string; bucket: 'all' | 'pending' | 'approved' | 'returned' | 'rejected'; }

const STATUS_MAP: Record<string, StatusMeta> = {
  Submitted: { tone: 'info', badge: '📬 Submitted', cardMod: 'info', bucket: 'pending' },
  'Maker Review': { tone: 'pending', badge: '⏳ Maker Review', cardMod: 'warning', bucket: 'pending' },
  'Maker-Approved': { tone: 'pending', badge: '⏳ Awaiting Checker', cardMod: 'warning', bucket: 'pending' },
  'Checker Review': { tone: 'pending', badge: '⏳ Checker Review', cardMod: 'warning', bucket: 'pending' },
  'In-Review': { tone: 'pending', badge: '⏳ In Review', cardMod: 'warning', bucket: 'pending' },
  Approved: { tone: 'approved', badge: '✓ Approved', cardMod: 'success', bucket: 'approved' },
  Rejected: { tone: 'rejected', badge: '✗ Rejected', cardMod: 'error', bucket: 'rejected' },
  Returned: { tone: 'pending', badge: '↩ Returned', cardMod: 'warning', bucket: 'returned' },
};

const FIELD_LABELS: Record<string, string> = {
  firstName: 'First Name', lastName: 'Last Name', email: 'Email', phone: 'Phone',
  phoneExtension: 'Extension', jobTitle: 'Job Title', address1: 'Address Line 1',
  city: 'City', state: 'State / Region', postalCode: 'Postal Code', country: 'Country',
};
const DOC_LABELS: Record<string, string> = {
  CR_COPY: 'CR Copy', BANK_GUARANTEE: 'Bank Guarantee', VAT_CERT: 'VAT Certificate', OTHER: 'Other Documents',
};

@Component({
  selector: 'app-track-requests',
  templateUrl: './track-requests.component.html',
  styleUrls: ['./track-requests.component.scss'],
})
export class TrackRequestsComponent implements OnInit, OnDestroy {
  customer!: Customer;
  all: CspRequest[] = [];
  filtered: CspRequest[] = [];
  activeFilter: 'all' | 'pending' | 'approved' | 'returned' | 'rejected' = 'all';

  modalOpen = false;
  modalRequest: CspRequest | null = null;

  // New request form
  newRequest = {
    type: '',
    priority: 'medium',
    subject: '',
    description: '',
    attachment: null as File | null,
  };

  // Success message
  showSubmitSuccess = false;
  generatedRequestId = '';

  // Validation
  showValidationError = false;
  missingFields: string[] = [];
  formTouched = false;

  // Alert modal
  showAlertModal = false;
  alertMessage = '';

  private sub = new Subscription();

  constructor(
    private readonly csp: CspService,
    private readonly bf: BulkFuelService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.customer = this.csp.getCustomer();
    this.refresh();
    this.sub.add(this.csp.submittedRequests$.subscribe(() => this.refresh()));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  refresh(): void {
    // Bulk fuel applications (new contract / amendment / termination) first, then standard requests.
    this.all = [...this.mapBulkFuelApplications(), ...this.csp.getCombinedRequests()];
    this.applyFilter();
  }

  /** Map persisted Bulk Fuel applications into the shared CspRequest shape so they appear in the tracker. */
  private mapBulkFuelApplications(): CspRequest[] {
    return this.bf.listApplications().map((app) => {
      const status = this.mapBulkStatus(app.status);
      return {
        requestId: app.referenceNumber,
        customerId: this.customer?.customerId ?? 'CUST-001',
        customerName: app.data?.customerName || this.customer?.customerName || 'Bulk Fuel Customer',
        submittedBy: app.data?.customerName || 'Customer User',
        submittedAt: app.submittedAt,
        requestType: app.type,
        status,
        stage: 'Submitted',
        reason: this.bulkFuelSummary(app),
        comments: null,
        profileChanges: null,
        documents: {},
        approvalTrail: [
          {
            stage: 'Submitted',
            timestamp: app.submittedAt,
            user: app.data?.customerName || 'Customer User',
            action: 'Bulk fuel application submitted',
            remarks: app.validUntil ? `Reference valid until ${this.formatDate(app.validUntil)}` : null,
          },
        ],
      } as CspRequest;
    });
  }

  private mapBulkStatus(status: string): RequestStatus {
    const s = (status || '').toLowerCase();
    if (s.includes('approve')) return 'Approved';
    if (s.includes('reject')) return 'Rejected';
    if (s.includes('return')) return 'Returned';
    if (s.includes('review')) return 'Maker Review';
    return 'Submitted';
  }

  /** Human-readable one-line summary of a bulk fuel application. */
  private bulkFuelSummary(app: BulkFuelApplication): string {
    const d = app.data || {};
    const t = (app.type || '').toLowerCase();
    if (t.includes('terminat')) {
      return `Termination of ${d.contractNo || 'contract'}${d.reason ? ' — ' + d.reason : ''}`;
    }
    if (t.includes('amend')) {
      return `${app.category || 'Amendment'} on ${d.contractNo || 'contract'}`;
    }
    const products = Array.isArray(d.products)
      ? d.products.map((p: any) => p.productName).filter(Boolean)
      : [];
    const parts = [app.category || 'New contract'];
    if (products.length) parts.push(products.join(', '));
    const docs = Array.isArray(app.documents) ? app.documents.length : 0;
    if (docs) parts.push(`${docs} document${docs === 1 ? '' : 's'}`);
    return parts.join(' · ');
  }

  setFilter(f: 'all' | 'pending' | 'approved' | 'returned' | 'rejected'): void {
    this.activeFilter = f;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeFilter === 'all') this.filtered = this.all;
    else this.filtered = this.all.filter((r) => this.metaFor(r.status).bucket === this.activeFilter);
  }

  metaFor(status: string): StatusMeta {
    return STATUS_MAP[status] ?? { tone: 'neutral', badge: status, cardMod: '', bucket: 'pending' };
  }

  count(bucket: 'all' | 'pending' | 'approved' | 'returned' | 'rejected'): number {
    if (bucket === 'all') return this.all.length;
    return this.all.filter((r) => this.metaFor(r.status).bucket === bucket).length;
  }

  fieldLabel(k: string): string { return FIELD_LABELS[k] ?? k; }
  docLabel(k: string): string { return DOC_LABELS[k] ?? k; }

  formatDate(iso?: string | null): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  }

  formatDateTime(iso?: string | null): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  formatBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  }

  daysAgo(iso: string): string {
    const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (d <= 0) return 'today';
    if (d === 1) return '1 day ago';
    return `${d} days ago`;
  }

  fieldChangeCount(r: CspRequest): number {
    return r.profileChanges?.changedFields?.length ?? 0;
  }

  docChangeCount(r: CspRequest): number {
    return Object.keys(r.documents || {}).length;
  }

  summaryFor(r: CspRequest): string {
    const fc = this.fieldChangeCount(r);
    const dc = this.docChangeCount(r);
    return [
      fc > 0 ? `${fc} profile field${fc === 1 ? '' : 's'} changed` : null,
      dc > 0 ? `${dc} document${dc === 1 ? '' : 's'}` : null,
    ].filter(Boolean).join(' · ') || r.reason || 'No payload';
  }

  isResubmittable(r: CspRequest): boolean {
    return r.status === 'Rejected' || r.status === 'Returned';
  }

  /** True for requests that originated from the Bulk Fuel module. */
  isBulkFuel(r: CspRequest): boolean {
    return r.requestId?.startsWith('BF-') || (r.requestType || '').startsWith('Bulk Fuel');
  }

  timelineStepClass(trail: ApprovalTrailEntry[], idx: number, status: RequestStatus): string {
    const isLast = idx === trail.length - 1;
    if (!isLast) return '';
    if (status === 'Rejected') return 'csp-timeline__step--rejected';
    if (status === 'Approved') return '';
    return 'csp-timeline__step--current';
  }

  documentKeys(req: CspRequest): string[] {
    return Object.keys(req.documents || {});
  }

  openDetails(r: CspRequest): void {
    this.modalRequest = r;
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.modalRequest = null;
  }

  resubmit(): void {
    this.closeModal();
    this.router.navigate(['/csp/edit-profile']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.alertMessage = 'File size must be less than 5MB. Please select a smaller file.';
        this.showAlertModal = true;
        input.value = '';
        return;
      }
      this.newRequest.attachment = file;
    }
  }

  closeAlertModal(): void {
    this.showAlertModal = false;
    this.alertMessage = '';
  }

  submitRequest(): void {
    this.formTouched = true;

    // Validate and collect missing fields
    this.missingFields = [];
    if (!this.newRequest.type) this.missingFields.push('Request Type');
    if (!this.newRequest.subject) this.missingFields.push('Subject');
    if (!this.newRequest.description) this.missingFields.push('Description');

    // If validation fails, show error popup
    if (this.missingFields.length > 0) {
      this.showValidationError = true;
      return;
    }

    // Submit request to CspService
    this.generatedRequestId = this.csp.submitGeneralRequest(
      this.newRequest.type,
      this.newRequest.subject,
      this.newRequest.description,
      this.newRequest.priority
    );

    // Show success message
    this.showSubmitSuccess = true;

    // Reset form
    this.resetForm();

    // Refresh list to show new request
    this.refresh();

    // Auto-close success message and scroll to new request after 3 seconds
    setTimeout(() => {
      this.showSubmitSuccess = false;
      this.generatedRequestId = '';
    }, 3000);
  }

  closeValidationError(): void {
    this.showValidationError = false;
  }

  isFieldInvalid(fieldName: string): boolean {
    if (!this.formTouched) return false;

    switch (fieldName) {
      case 'type':
        return !this.newRequest.type;
      case 'subject':
        return !this.newRequest.subject;
      case 'description':
        return !this.newRequest.description;
      default:
        return false;
    }
  }

  resetForm(): void {
    this.newRequest = {
      type: '',
      priority: 'medium',
      subject: '',
      description: '',
      attachment: null,
    };
    this.formTouched = false;
    this.missingFields = [];
  }
}
