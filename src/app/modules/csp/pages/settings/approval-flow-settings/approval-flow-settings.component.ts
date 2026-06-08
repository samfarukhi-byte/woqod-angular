import { Component, OnInit } from '@angular/core';
import { CspService } from '../../../../../core/services/csp.service';
import { ApprovalFlowConfig, LOB, UserRole, ApprovalStep } from '../../../../../models/settings.model';

@Component({
  selector: 'app-approval-flow-settings',
  templateUrl: './approval-flow-settings.component.html',
  styleUrls: ['./approval-flow-settings.component.scss'],
})
export class ApprovalFlowSettingsComponent implements OnInit {
  approvalFlows: ApprovalFlowConfig[] = [];
  showConfigModal = false;
  editingFlow: ApprovalFlowConfig | null = null;

  constructor(private readonly csp: CspService) {}

  ngOnInit(): void {
    this.approvalFlows = this.csp.getApprovalFlows();
  }

  toggleFlow(flow: ApprovalFlowConfig): void {
    flow.enabled = !flow.enabled;
    this.csp.saveApprovalFlow(flow);
  }

  toggleAutoSync(flow: ApprovalFlowConfig): void {
    flow.autoSyncToERP = !flow.autoSyncToERP;
    this.csp.saveApprovalFlow(flow);
  }

  openConfigModal(flow: ApprovalFlowConfig): void {
    this.editingFlow = { ...flow };
    this.showConfigModal = true;
  }

  closeConfigModal(): void {
    this.showConfigModal = false;
    this.editingFlow = null;
  }

  saveConfiguration(): void {
    if (this.editingFlow) {
      this.csp.saveApprovalFlow(this.editingFlow);
      const index = this.approvalFlows.findIndex(f => f.flowId === this.editingFlow!.flowId);
      if (index >= 0) {
        this.approvalFlows[index] = this.editingFlow;
      }
    }
    this.closeConfigModal();
  }

  getFlowIcon(flowType: string): string {
    const icons: Record<string, string> = {
      invoice: '📄',
      purchase_order: '🛒',
      delivery: '🚚',
      credit_note: '💳',
    };
    return icons[flowType] || '📋';
  }

  getFlowLabel(flowType: string): string {
    return flowType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  getLOBBadgeClass(lob: LOB): string {
    const classes: Record<LOB, string> = {
      'Fuel': 'csp-lob-badge--fuel',
      'APC': 'csp-lob-badge--apc',
      'Bulk Fuel': 'csp-lob-badge--bulk',
    };
    return classes[lob] || '';
  }
}
