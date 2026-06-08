import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CspService } from '../../../../core/services/csp.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ApprovalTrailEntry, CspRequest } from '../../../../models/request.model';

@Component({
  selector: 'app-checker-approval',
  templateUrl: './checker-approval.component.html',
  styleUrls: ['./checker-approval.component.scss'],
})
export class CheckerApprovalComponent implements OnInit, OnDestroy {
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

  private get actor(): string { return this.auth.currentUser?.name ?? 'Checker'; }

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
      .filter((r) => r.status === 'Maker-Approved' || r.status === 'Checker Review');
    if (this.selected) {
      this.selected = this.queue.find((r) => r.requestId === this.selected!.requestId) ?? null;
    }
  }

  select(r: CspRequest): void {
    this.selected = r;
    this.remarks = '';
    this.remarksError = false;
  }

  makerEntry(r: CspRequest): ApprovalTrailEntry | null {
    return [...(r.approvalTrail ?? [])].reverse().find((e) => e.stage === 'Maker Review') ?? null;
  }

  formatDateTime(iso?: string | null): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  }

  approveAndUpdateErp(): void {
    if (!this.selected || !this.requireRemarks()) return;
    const id = this.selected.requestId;
    this.csp.updateRequestStatus(id, 'Approved', 'Checker Approval', 'Approved & ERP write simulated', this.remarks.trim(), this.actor);
    this.toast.success(`${id} approved — ERP write simulated.`);
    this.selected = null;
    this.remarks = '';
  }

  reject(): void {
    if (!this.selected || !this.requireRemarks()) return;
    const id = this.selected.requestId;
    this.csp.updateRequestStatus(id, 'Rejected', 'Checker Approval', 'Rejected at Checker stage', this.remarks.trim(), this.actor);
    this.toast.error(`${id} rejected.`);
    this.selected = null;
    this.remarks = '';
  }

  documentKeys(r: CspRequest): string[] {
    return Object.keys(r.documents || {});
  }
}
