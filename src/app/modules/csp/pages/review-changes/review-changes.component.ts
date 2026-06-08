import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CspService } from '../../../../core/services/csp.service';
import { Customer } from '../../../../models/customer.model';
import { StagedDocumentMap } from '../../../../models/document.model';
import { ProfileChangeDraft } from '../../../../models/request.model';

const DOC_LABELS: Record<string, string> = {
  CR_COPY: 'CR Copy',
  BANK_GUARANTEE: 'Bank Guarantee',
  VAT_CERT: 'VAT Certificate',
  OTHER: 'Other Documents',
};

@Component({
  selector: 'app-review-changes',
  templateUrl: './review-changes.component.html',
  styleUrls: ['./review-changes.component.scss'],
})
export class ReviewChangesComponent implements OnInit, OnDestroy {
  customer!: Customer;
  diff: ProfileChangeDraft | null = null;
  staged: StagedDocumentMap = {};
  form!: FormGroup;
  showSuccess = false;
  showError = false;
  errorMessage = '';
  createdId = 'REQ-…';
  triedSubmit = false;

  private sub = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly csp: CspService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.customer = this.csp.getCustomer();
    this.form = this.fb.group({
      reason: ['', Validators.required],
      comments: [''],
      confirm: [false, Validators.requiredTrue],
    });
    this.sub.add(this.csp.profileChanges$.subscribe((d) => (this.diff = d)));
    this.sub.add(this.csp.uploadedDocuments$.subscribe((s) => (this.staged = s ?? {})));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get fieldCount(): number {
    return this.diff?.changedFields?.length ?? 0;
  }

  get docCount(): number {
    return Object.keys(this.staged).length;
  }

  get docList(): { code: string; label: string; fileName: string; fileSize: number; uploadedAt: string }[] {
    return Object.keys(this.staged).map((code) => ({
      code,
      label: DOC_LABELS[code] ?? code,
      fileName: this.staged[code].fileName,
      fileSize: this.staged[code].fileSize,
      uploadedAt: this.staged[code].uploadedAt,
    }));
  }

  get requestType(): string {
    if (this.fieldCount > 0 && this.docCount > 0) return 'Profile + Documents Update';
    if (this.fieldCount > 0) return 'Profile Update';
    if (this.docCount > 0) return 'Document Update';
    return 'Profile Update';
  }

  get footerStatus(): string {
    if (this.fieldCount === 0 && this.docCount === 0) return 'Nothing staged yet.';
    return `<strong>${this.fieldCount}</strong> profile field${this.fieldCount === 1 ? '' : 's'}, <strong>${this.docCount}</strong> document${this.docCount === 1 ? '' : 's'} staged.`;
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

  onSubmit(): void {
    this.triedSubmit = true;
    this.showSuccess = false;
    this.showError = false;
    if (this.fieldCount === 0 && this.docCount === 0) {
      this.showError = true;
      this.errorMessage = '<strong>Nothing to submit.</strong> Stage at least one profile change or document upload first.';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showError = true;
      this.errorMessage = '<strong>Please complete the highlighted fields.</strong>';
      return;
    }
    const reqId = this.csp.submitRequest({
      reason: this.form.value.reason,
      comments: this.form.value.comments?.trim() || null,
      profileChanges: this.diff,
      documents: this.staged,
    });
    this.csp.clearDrafts();
    this.createdId = reqId;
    this.showSuccess = true;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => this.router.navigate(['/csp/track-requests']), reduceMotion ? 0 : 1500);
  }

  isInvalid(field: 'reason' | 'confirm'): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.triedSubmit);
  }
}
