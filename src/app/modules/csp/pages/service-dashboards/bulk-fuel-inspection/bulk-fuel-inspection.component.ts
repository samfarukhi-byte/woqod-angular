import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BulkFuelInspection, BulkFuelService } from '../../../../../core/services/bulk-fuel.service';

@Component({
  selector: 'app-bulk-fuel-inspection',
  templateUrl: './bulk-fuel-inspection.component.html',
  styleUrls: ['./bulk-fuel-inspection.component.scss'],
})
export class BulkFuelInspectionComponent implements OnInit {
  inspections: BulkFuelInspection[] = [];

  // Reply modal
  showReply = false;
  replyTarget: BulkFuelInspection | null = null;
  replyComment = '';
  acknowledgedIds = new Set<string>();

  // Toast
  toast = '';

  constructor(private readonly router: Router, private readonly bf: BulkFuelService) {}

  ngOnInit(): void {
    this.inspections = this.bf.getInspections();
  }

  get upcoming(): number { return this.inspections.filter((i) => i.status !== 'Completed').length; }

  statusClass(status: string): string {
    if (status === 'Completed') return 'csp-badge--approved';
    if (status === 'Due') return 'csp-badge--pending';
    return 'csp-badge--info';
  }

  isAcknowledged(i: BulkFuelInspection): boolean { return this.acknowledgedIds.has(i.id); }

  acknowledge(i: BulkFuelInspection): void {
    this.acknowledgedIds.add(i.id);
    this.flash(`Inspection for ${i.tankNo} acknowledged.`);
  }

  openReply(i: BulkFuelInspection): void {
    this.replyTarget = i;
    this.replyComment = '';
    this.showReply = true;
  }
  closeReply(): void { this.showReply = false; this.replyTarget = null; this.replyComment = ''; }
  sendReply(): void {
    if (!this.replyComment.trim()) return;
    const tank = this.replyTarget?.tankNo;
    this.closeReply();
    this.flash(`Your reply for ${tank} has been sent to the Installations team.`);
  }

  private flash(msg: string): void {
    this.toast = msg;
    setTimeout(() => (this.toast = ''), 3200);
  }

  backToBulkFuel(): void { this.router.navigate(['/csp/services/bulk-fuel/dashboard']); }
}
