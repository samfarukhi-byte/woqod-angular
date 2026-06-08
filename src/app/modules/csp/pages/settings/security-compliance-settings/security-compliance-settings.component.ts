import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CspService } from '../../../../../core/services/csp.service';
import {
  PasswordPolicy,
  SessionSettings,
  LoginHistoryEntry,
  AuditLogEntry,
  SettingsState,
} from '../../../../../models/settings.model';

@Component({
  selector: 'app-security-compliance-settings',
  templateUrl: './security-compliance-settings.component.html',
  styleUrls: ['./security-compliance-settings.component.scss'],
})
export class SecurityComplianceSettingsComponent implements OnInit, OnDestroy {
  passwordPolicy: PasswordPolicy;
  twoFactorEnabled = false;
  loginHistory: LoginHistoryEntry[] = [];
  auditLog: AuditLogEntry[] = [];

  private sub = new Subscription();

  constructor(private readonly csp: CspService) {
    this.passwordPolicy = this.csp.getPasswordPolicy();
  }

  ngOnInit(): void {
    this.loginHistory = this.csp.getLoginHistory();
    this.auditLog = this.csp.getAuditLog();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleTwoFactor(enabled: boolean): void {
    this.twoFactorEnabled = enabled;
    // In production, this would save to backend
  }

  exportAuditLog(): void {
    const blob = this.csp.exportAuditLog();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  formatDateTime(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  loginStatusBadgeClass(status: string): string {
    return status === 'Success' ? 'csp-badge--approved' : 'csp-badge--rejected';
  }
}
