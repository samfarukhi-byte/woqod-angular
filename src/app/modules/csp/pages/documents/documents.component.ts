import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CspService } from '../../../../core/services/csp.service';
import { DocumentType, ExistingDocument, StagedDocument, StagedDocumentMap } from '../../../../models/document.model';
import { Customer } from '../../../../models/customer.model';

const DOCUMENT_TYPES: DocumentType[] = [
  { code: 'CR_COPY', name: 'CR Copy (Commercial Register)', required: true, description: 'Official government-issued CR document.', expiryRequired: false, accepted: ['pdf', 'jpg', 'png'], maxSizeMB: 5 },
  { code: 'BANK_GUARANTEE', name: 'Bank Guarantee', required: true, description: 'Bank-issued guarantee document for credit.', expiryRequired: true, accepted: ['pdf', 'jpg', 'png'], maxSizeMB: 5 },
  { code: 'VAT_CERT', name: 'VAT Certificate', required: false, description: 'Official VAT registration certificate.', expiryRequired: false, accepted: ['pdf', 'jpg', 'png'], maxSizeMB: 5 },
  { code: 'OTHER', name: 'Other Documents', required: false, description: 'Any other supporting documents.', expiryRequired: false, accepted: ['pdf', 'jpg', 'png', 'doc', 'docx', 'xls', 'xlsx'], maxSizeMB: 10 },
];

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit, OnDestroy {
  customer!: Customer;
  documentTypes = DOCUMENT_TYPES;
  existing: ExistingDocument[] = [];
  staged: StagedDocumentMap = {};
  errors: Record<string, string> = {};
  dragOver: Record<string, boolean> = {};
  requiredSummary = '';
  footerStatus = 'No new files staged.';

  // Modals
  showConfirmClear = false;
  showAlertModal = false;
  alertMessage = '';

  private sub = new Subscription();

  constructor(private readonly csp: CspService) {}

  ngOnInit(): void {
    this.customer = this.csp.getCustomer();
    this.existing = this.csp.getExistingDocuments();
    this.sub.add(
      this.csp.uploadedDocuments$.subscribe((s) => {
        this.staged = { ...(s ?? {}) };
        this.refreshSummary();
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  requiredTypes(): DocumentType[] { return this.documentTypes.filter((t) => t.required); }
  optionalTypes(): DocumentType[] { return this.documentTypes.filter((t) => !t.required); }

  existingFor(code: string): ExistingDocument | null {
    return this.existing.find((d) => d.docType === code) ?? null;
  }

  stagedFor(code: string): StagedDocument | null {
    return this.staged[code] ?? null;
  }

  acceptList(t: DocumentType): string {
    return t.accepted.map((e) => '.' + e).join(',');
  }

  acceptDisplay(t: DocumentType): string {
    return t.accepted.join(', ').toUpperCase();
  }

  formatBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  }

  formatDate(iso?: string | null): string {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  }

  badgeClass(status: string): string {
    if (status === 'Approved') return 'csp-badge--approved';
    if (status === 'Expired') return 'csp-badge--rejected';
    if (status === 'Pending Review' || status === 'Requires Update') return 'csp-badge--pending';
    return 'csp-badge--info';
  }

  badgeIcon(status: string): string {
    if (status === 'Approved') return '✓';
    if (status === 'Expired') return '✗';
    if (status === 'Pending Review') return '⏳';
    if (status === 'Requires Update') return '⚠';
    return 'ⓘ';
  }

  cardClass(t: DocumentType, ex: ExistingDocument | null): string {
    if (!ex && t.required) return 'csp-doc-card--required';
    return '';
  }

  onFilePicked(code: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(code, file);
    input.value = '';
  }

  onDragOver(code: string, e: DragEvent): void {
    e.preventDefault();
    this.dragOver[code] = true;
  }

  onDragLeave(code: string): void {
    this.dragOver[code] = false;
  }

  onDrop(code: string, e: DragEvent): void {
    e.preventDefault();
    this.dragOver[code] = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.handleFile(code, file);
  }

  unstage(code: string): void {
    const next = { ...this.staged };
    delete next[code];
    this.csp.saveUploadedDocuments(next);
  }

  clearAllStaged(): void {
    if (Object.keys(this.staged).length === 0) return;
    this.showConfirmClear = true;
  }

  confirmClearAll(): void {
    this.csp.saveUploadedDocuments({});
    this.showConfirmClear = false;
  }

  cancelClearAll(): void {
    this.showConfirmClear = false;
  }

  alertNotImplemented(action: 'view' | 'history', code: string, version?: number): void {
    if (action === 'view') {
      this.alertMessage = `View ${code} — preview not implemented in prototype.`;
    } else {
      this.alertMessage = `Version history for ${code} (v${version ?? '?'}) — not implemented in prototype.`;
    }
    this.showAlertModal = true;
  }

  closeAlertModal(): void {
    this.showAlertModal = false;
    this.alertMessage = '';
  }

  private handleFile(code: string, file: File): void {
    this.errors[code] = '';
    const t = this.documentTypes.find((x) => x.code === code);
    if (!t) return;
    const ext = (file.name.split('.').pop() ?? '').toLowerCase();
    if (!t.accepted.includes(ext)) {
      this.errors[code] = `Unsupported file type. Allowed: ${this.acceptDisplay(t)}.`;
      return;
    }
    if (file.size > t.maxSizeMB * 1024 * 1024) {
      this.errors[code] = `File too large. Max ${t.maxSizeMB} MB; this file is ${this.formatBytes(file.size)}.`;
      return;
    }
    const next: StagedDocumentMap = {
      ...this.staged,
      [code]: { fileName: file.name, fileSize: file.size, uploadedAt: new Date().toISOString(), status: 'Staged' },
    };
    this.csp.saveUploadedDocuments(next);
  }

  private refreshSummary(): void {
    const reqMissing = this.documentTypes
      .filter((t) => t.required)
      .filter((t) => !this.existingFor(t.code) && !this.staged[t.code]).length;
    const reqStaged = this.documentTypes.filter((t) => t.required && this.staged[t.code]).length;
    if (reqMissing > 0) {
      this.requiredSummary = `<span style="color:#e11d48;">${reqMissing} missing</span>`;
    } else if (reqStaged > 0) {
      this.requiredSummary = `<span style="color:#009a33;">${reqStaged} new file${reqStaged === 1 ? '' : 's'} staged</span>`;
    } else {
      this.requiredSummary = 'All required documents on file';
    }
    const total = Object.keys(this.staged).length;
    this.footerStatus = total === 0 ? 'No new files staged.' : `<strong>${total}</strong> new file${total === 1 ? '' : 's'} staged. Click Next to review.`;
  }
}
