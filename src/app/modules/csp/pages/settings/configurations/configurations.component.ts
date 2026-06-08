import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CspService } from '../../../../../core/services/csp.service';
import {
  ConfigurationApprover,
  ConfigurationApprovalType,
  ConfigurationFlow,
  User,
} from '../../../../../models/settings.model';

interface ApprovalTypeOption {
  value: ConfigurationApprovalType;
  label: string;
  icon: string;
  slug: string;
}

@Component({
  selector: 'app-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.scss'],
})
export class ConfigurationsComponent implements OnInit, OnDestroy {
  configurations: ConfigurationFlow[] = [];
  users: User[] = [];

  // Create / edit modal
  showModal = false;
  isNew = false;
  editing: ConfigurationFlow | null = null;
  saveFormTouched = false;

  // Delete confirmation
  showConfirmDelete = false;
  configToDelete: ConfigurationFlow | null = null;

  // Validation & success feedback
  showValidationModal = false;
  validationErrors: string[] = [];
  showSuccessModal = false;
  successMessage = '';

  readonly approvalTypes: ApprovalTypeOption[] = [
    { value: 'invoice_verification', label: 'Invoice Verification', icon: '🧾', slug: 'invoice-verification' },
    { value: 'document_edit', label: 'Document Edit', icon: '📝', slug: 'document-edit' },
    { value: 'document_update', label: 'Document Update', icon: '📄', slug: 'document-update' },
    { value: 'profile_change', label: 'Profile Change Request', icon: '🏢', slug: 'profile-change' },
    { value: 'custom_request', label: 'Custom Request', icon: '⚙️', slug: 'custom-request' },
  ];

  private sub = new Subscription();

  constructor(private readonly csp: CspService) {}

  ngOnInit(): void {
    this.sub.add(this.csp.configurations$.subscribe((c) => (this.configurations = c ?? [])));
    this.sub.add(this.csp.users$.subscribe((u) => (this.users = u ?? [])));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ----- type helpers -----
  typeOption(type: ConfigurationApprovalType): ApprovalTypeOption {
    return this.approvalTypes.find((t) => t.value === type) ?? this.approvalTypes[0];
  }

  getTypeLabel(type: ConfigurationApprovalType): string {
    return this.typeOption(type).label;
  }

  getTypeIcon(type: ConfigurationApprovalType): string {
    return this.typeOption(type).icon;
  }

  buildEndpointPath(type: ConfigurationApprovalType): string {
    return `/api/v1/approvals/${this.typeOption(type).slug}`;
  }

  // ----- list actions -----
  toggleEnabled(config: ConfigurationFlow): void {
    this.csp.saveConfiguration({ ...config, enabled: !config.enabled });
  }

  openAddModal(): void {
    this.isNew = true;
    this.saveFormTouched = false;
    this.editing = {
      configId: 'CFG-' + Date.now(),
      name: '',
      approvalType: 'invoice_verification',
      description: '',
      enabled: true,
      approvers: [this.blankApprover(1)],
      pushToOpenApi: true,
      apiEndpointPath: this.buildEndpointPath('invoice_verification'),
      createdDate: new Date().toISOString(),
    };
    this.showModal = true;
  }

  openEditModal(config: ConfigurationFlow): void {
    this.isNew = false;
    this.saveFormTouched = false;
    this.editing = {
      ...config,
      approvers: config.approvers.map((a) => ({ ...a })),
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editing = null;
    this.saveFormTouched = false;
  }

  // ----- approver levels -----
  private blankApprover(level: number): ConfigurationApprover {
    return { levelId: 'LVL-' + Date.now() + '-' + level, level, title: '', userId: '', userName: '', userEmail: '' };
  }

  addApprover(): void {
    if (!this.editing) return;
    this.editing.approvers.push(this.blankApprover(this.editing.approvers.length + 1));
  }

  removeApprover(levelId: string): void {
    if (!this.editing) return;
    this.editing.approvers = this.editing.approvers
      .filter((a) => a.levelId !== levelId)
      .map((a, i) => ({ ...a, level: i + 1 }));
  }

  onApproverUserChange(approver: ConfigurationApprover, userId: string): void {
    const user = this.users.find((u) => u.userId === userId);
    approver.userId = userId;
    approver.userName = user?.fullName ?? '';
    approver.userEmail = user?.email ?? '';
  }

  onApprovalTypeChange(): void {
    if (!this.editing) return;
    this.editing.apiEndpointPath = this.buildEndpointPath(this.editing.approvalType);
  }

  // ----- save -----
  saveConfig(): void {
    if (!this.editing) return;
    this.saveFormTouched = true;
    this.validationErrors = [];

    if (!this.editing.name || this.editing.name.trim().length < 3) {
      this.validationErrors.push('Configuration name must be at least 3 characters');
    }
    if (this.editing.approvers.length === 0) {
      this.validationErrors.push('At least one approval level is required');
    }
    this.editing.approvers.forEach((a, i) => {
      const label = `Level ${i + 1}`;
      if (!a.title || a.title.trim().length < 2) {
        this.validationErrors.push(`${label}: Level title must be at least 2 characters`);
      }
      if (!a.userId) {
        this.validationErrors.push(`${label}: An approver must be selected`);
      }
    });

    if (this.validationErrors.length > 0) {
      this.showValidationModal = true;
      return;
    }

    // Renumber levels in order and refresh the endpoint path.
    const config: ConfigurationFlow = {
      ...this.editing,
      name: this.editing.name.trim(),
      approvers: this.editing.approvers.map((a, i) => ({ ...a, level: i + 1 })),
      apiEndpointPath: this.editing.pushToOpenApi ? this.buildEndpointPath(this.editing.approvalType) : undefined,
    };

    this.csp.saveConfiguration(config);
    const wasNew = this.isNew;
    this.closeModal();
    this.successMessage = wasNew
      ? `Configuration "${config.name}" created successfully!`
      : `Configuration "${config.name}" updated successfully!`;
    this.showSuccessModal = true;
  }

  // ----- delete -----
  requestDelete(config: ConfigurationFlow): void {
    this.configToDelete = config;
    this.showConfirmDelete = true;
  }

  confirmDelete(): void {
    if (this.configToDelete) {
      this.csp.deleteConfiguration(this.configToDelete.configId);
    }
    this.showConfirmDelete = false;
    this.configToDelete = null;
  }

  cancelDelete(): void {
    this.showConfirmDelete = false;
    this.configToDelete = null;
  }

  closeValidationModal(): void {
    this.showValidationModal = false;
    this.validationErrors = [];
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.successMessage = '';
  }

  // ----- validation helpers for inline field errors -----
  isNameInvalid(): boolean {
    return this.saveFormTouched && (!this.editing?.name || this.editing.name.trim().length < 3);
  }

  isApproverTitleInvalid(approver: ConfigurationApprover): boolean {
    return this.saveFormTouched && (!approver.title || approver.title.trim().length < 2);
  }

  isApproverUserInvalid(approver: ConfigurationApprover): boolean {
    return this.saveFormTouched && !approver.userId;
  }

  trackByLevelId(_index: number, approver: ConfigurationApprover): string {
    return approver.levelId;
  }
}
