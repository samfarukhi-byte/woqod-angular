import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CspService } from '../../../../core/services/csp.service';
import { Address, Customer } from '../../../../models/customer.model';
import { ExistingDocument } from '../../../../models/document.model';

const SERVICE_ICONS: Record<string, string> = {
  'Fuel': '⛽',
  'Auto Care': '🛠',
  'SHAFAF': '⚡',
  'APC Car Wash': '🚿',
  'Grocery': '🛒',
};

const DOC_TYPE_LABELS: Record<string, string> = {
  CR_COPY: 'CR Copy',
  BANK_GUARANTEE: 'Bank Guarantee',
  VAT_CERT: 'VAT Certificate',
  OTHER: 'Other Documents',
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  customer!: Customer;
  documents: ExistingDocument[] = [];
  pendingChangesText = 'None';
  billingSameAsRegistered = false;

  private sub = new Subscription();

  constructor(private readonly csp: CspService) {}

  ngOnInit(): void {
    this.customer = this.csp.getCustomer();
    this.documents = this.csp.getExistingDocuments();
    this.billingSameAsRegistered = this.addressesEqual(
      this.customer.registeredAddress,
      this.customer.billingAddress,
    );
    this.sub.add(
      this.csp.profileChanges$.subscribe((draft) => {
        const n = draft?.changedFields?.length ?? 0;
        this.pendingChangesText = n === 0 ? 'None' : `${n} field${n === 1 ? '' : 's'} pending review`;
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  initial(s: string): string {
    return (s?.trim()?.[0] ?? '?').toUpperCase();
  }

  fullContactName(): string {
    const c = this.customer.primaryContact;
    return [c.prefix, c.firstName, c.middleName, c.lastName].filter(Boolean).join(' ') || '—';
  }

  formatDate(iso?: string | null): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  }

  formatCurrency(n: number, currency: string): string {
    try {
      return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
    } catch {
      return `${currency} ${n.toLocaleString()}`;
    }
  }

  addressLines(a: Address | null | undefined): string {
    if (!a) return '—';
    return [
      [a.address1, a.address2].filter(Boolean).join(', '),
      [a.city, a.state, a.postalCode].filter(Boolean).join(', '),
      a.country || '',
    ]
      .filter(Boolean)
      .join('<br>');
  }

  serviceIcon(s: string): string {
    return SERVICE_ICONS[s] ?? '•';
  }

  docTypeLabel(code: string): string {
    return DOC_TYPE_LABELS[code] ?? code;
  }

  documentRowClass(status: string): string {
    if (status === 'Expired') return 'csp-document-row--error';
    if (status === 'Pending Review') return 'csp-document-row--warning';
    return '';
  }

  documentBadgeClass(status: string): string {
    if (status === 'Approved') return 'csp-badge--approved';
    if (status === 'Expired') return 'csp-badge--rejected';
    if (status === 'Pending Review') return 'csp-badge--pending';
    return 'csp-badge--info';
  }

  documentBadgeIcon(status: string): string {
    if (status === 'Approved') return '✓';
    if (status === 'Expired') return '✗';
    if (status === 'Pending Review') return '⏳';
    return 'ⓘ';
  }

  telHref(phone: string): string {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
  }

  private addressesEqual(a: Address, b: Address): boolean {
    if (!a || !b) return false;
    return (['country', 'address1', 'address2', 'city', 'state', 'postalCode'] as const).every(
      (k) => (a[k] ?? '') === (b[k] ?? ''),
    );
  }
}
