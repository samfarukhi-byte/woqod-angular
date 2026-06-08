import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CspService } from '../../../../core/services/csp.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CspRequest } from '../../../../models/request.model';

@Component({
  selector: 'app-maker-review',
  templateUrl: './maker-review.component.html',
  styleUrls: ['./maker-review.component.scss'],
})
export class MakerReviewComponent implements OnInit, OnDestroy {
  queue: CspRequest[] = [];
  selected: CspRequest | null = null;
  remarks = '';
  toastMessage = '';
  remarksError = false;

  private sub = new Subscription();

  constructor(
    private readonly csp: CspService,
    private readonly auth: AuthService,
    private readonly toast: ToastService,
  ) {}

  private get actor(): string { return this.auth.currentUser?.name ?? 'Maker'; }

  /** All decisions require remarks for auditability. */
  private requireRemarks(): boolean {
    if (this.remarks.trim().length >= 3) { this.remarksError = false; return true; }
    this.remarksError = true;
    this.toast.error('Please add remarks (min 3 characters) before recording a decision.');
    return false;
  }

  ngOnInit(): void {
    this.sub.add(this.csp.submittedRequests$.subscribe(() => this.refresh()));
    this.refresh();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  refresh(): void {
    this.queue = this.csp
      .getCombinedRequests()
      .filter((r) => r.status === 'Submitted' || r.status === 'Maker Review' || r.status === 'Returned');
    if (this.selected) {
      this.selected = this.queue.find((r) => r.requestId === this.selected!.requestId) ?? null;
    }
  }

  select(r: CspRequest): void {
    this.selected = r;
    this.remarks = '';
    this.remarksError = false;
  }

  formatDateTime(iso?: string | null): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  }

  approveToChecker(): void {
    if (!this.selected || !this.requireRemarks()) return;
    const id = this.selected.requestId;
    this.csp.updateRequestStatus(id, 'Maker-Approved', 'Checker Review', 'Approved and sent to Checker', this.remarks.trim(), this.actor);
    this.toast.success(`${id} forwarded to Checker queue.`);
    this.selected = null;
    this.remarks = '';
  }

  returnToCustomer(): void {
    if (!this.selected || !this.requireRemarks()) return;
    const id = this.selected.requestId;
    this.csp.updateRequestStatus(id, 'Returned', 'Maker Review', 'Returned to customer', this.remarks.trim(), this.actor);
    this.toast.warning(`${id} returned to customer for correction.`);
    this.selected = null;
    this.remarks = '';
  }

  reject(): void {
    if (!this.selected || !this.requireRemarks()) return;
    const id = this.selected.requestId;
    this.csp.updateRequestStatus(id, 'Rejected', 'Maker Review', 'Rejected at Maker stage', this.remarks.trim(), this.actor);
    this.toast.error(`${id} rejected.`);
    this.selected = null;
    this.remarks = '';
  }

  fieldChangeCount(r: CspRequest): number {
    return r.profileChanges?.changedFields?.length ?? 0;
  }
  docChangeCount(r: CspRequest): number {
    return Object.keys(r.documents || {}).length;
  }
  documentKeys(r: CspRequest): string[] {
    return Object.keys(r.documents || {});
  }
}
