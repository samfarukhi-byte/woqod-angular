import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CspService } from '../../../../../core/services/csp.service';
import { ToastService } from '../../../../../core/services/toast.service';
import {
  FleetVehicle,
  Voucher,
  VoucherStatus,
  WeekDay,
  WoqodStation,
} from '../../../../../models/voucher.model';

interface VoucherDraft {
  vehicleId: string;
  driverName: string;
  driverPhone: string;
  amount: number | null;
  expiryDate: string;
  stationCodes: string[];
  allowedDays: WeekDay[];
  dailyLimit: number | null;
  weeklyLimit: number | null;
  monthlyLimit: number | null;
}

@Component({
  selector: 'app-voucher-management',
  templateUrl: './voucher-management.component.html',
  styleUrls: ['./voucher-management.component.scss'],
})
export class VoucherManagementComponent implements OnInit, OnDestroy {
  vouchers: Voucher[] = [];
  stations: WoqodStation[] = [];
  vehicles: FleetVehicle[] = [];
  readonly weekDays: WeekDay[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  activeTab: 'vouchers' | 'reports' = 'vouchers';

  creditLimit = 0;
  currency = 'QAR';

  // Generate / create modal
  showCreateModal = false;
  formTouched = false;
  validationErrors: string[] = [];
  draft: VoucherDraft = this.blankDraft();

  // QR / SMS modal
  showQrModal = false;
  qrVoucher: Voucher | null = null;

  // Cancel confirmation
  showCancelModal = false;
  voucherToCancel: Voucher | null = null;

  private sub = new Subscription();

  constructor(
    private readonly csp: CspService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.stations = this.csp.getWoqodStations();
    this.creditLimit = this.csp.getCustomer().creditLimit;
    this.currency = this.csp.getCustomer().currency || 'QAR';
    this.sub.add(this.csp.vouchers$.subscribe((v) => (this.vouchers = v ?? [])));
    this.sub.add(this.csp.fleetVehicles$.subscribe((v) => (this.vehicles = v ?? [])));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  back(): void {
    this.router.navigate(['/csp/services/retail']);
  }

  setTab(tab: 'vouchers' | 'reports'): void {
    this.activeTab = tab;
  }

  // ---------- derived voucher state ----------
  redeemedTotal(v: Voucher): number {
    return (v.redemptions ?? []).reduce((sum, r) => sum + r.amount, 0);
  }

  remaining(v: Voucher): number {
    return Math.max(0, v.amount - this.redeemedTotal(v));
  }

  utilizationPct(v: Voucher): number {
    if (v.amount <= 0) return 0;
    return Math.round((this.redeemedTotal(v) / v.amount) * 100);
  }

  isExpired(v: Voucher): boolean {
    // Expiry is end-of-day on the expiry date.
    return new Date(v.expiryDate + 'T23:59:59').getTime() < Date.now();
  }

  effectiveStatus(v: Voucher): VoucherStatus {
    if (v.baseStatus === 'Cancelled') return 'Cancelled';
    if (this.remaining(v) <= 0) return 'Redeemed';
    if (this.isExpired(v)) return 'Expired';
    return 'Active';
  }

  statusBadgeClass(v: Voucher): string {
    switch (this.effectiveStatus(v)) {
      case 'Active': return 'csp-badge--approved';
      case 'Redeemed': return 'csp-badge--info';
      case 'Expired': return 'csp-badge--pending';
      default: return 'csp-badge--neutral';
    }
  }

  isUsed(v: Voucher): boolean {
    return this.redeemedTotal(v) > 0;
  }

  // ---------- credit metrics ----------
  // Credit is NOT reserved when a voucher is issued. Only actual redemptions consume
  // the credit limit, and each redemption is validated against availability at use time.
  /** Money actually redeemed across all vouchers. */
  get utilizedCredit(): number {
    return this.vouchers.reduce((sum, v) => sum + this.redeemedTotal(v), 0);
  }

  /** Informational only: unredeemed face value of still-active vouchers (does NOT reduce available credit). */
  get activeVoucherValue(): number {
    return this.vouchers
      .filter((v) => this.effectiveStatus(v) === 'Active')
      .reduce((sum, v) => sum + this.remaining(v), 0);
  }

  get availableCredit(): number {
    return Math.max(0, this.creditLimit - this.utilizedCredit);
  }

  get creditUsedPct(): number {
    if (this.creditLimit <= 0) return 0;
    return Math.round((this.utilizedCredit / this.creditLimit) * 100);
  }

  // ---------- voucher counts ----------
  countBy(status: VoucherStatus): number {
    return this.vouchers.filter((v) => this.effectiveStatus(v) === status).length;
  }
  get totalVouchers(): number { return this.vouchers.length; }

  // ---------- create voucher ----------
  private blankDraft(): VoucherDraft {
    return {
      vehicleId: '',
      driverName: '',
      driverPhone: '',
      amount: null,
      expiryDate: '',
      stationCodes: [],
      allowedDays: [],
      dailyLimit: null,
      weeklyLimit: null,
      monthlyLimit: null,
    };
  }

  openCreateModal(): void {
    this.draft = this.blankDraft();
    this.formTouched = false;
    this.validationErrors = [];
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.validationErrors = [];
    this.formTouched = false;
  }

  /** When a vehicle is selected, auto-populate its assigned driver + phone (still editable). */
  onVehicleChange(vehicleId: string): void {
    this.draft.vehicleId = vehicleId;
    const veh = this.vehicles.find((v) => v.vehicleId === vehicleId);
    if (veh) {
      this.draft.driverName = veh.driverName;
      this.draft.driverPhone = veh.driverPhone;
    }
  }

  toggleStation(code: string): void {
    const i = this.draft.stationCodes.indexOf(code);
    if (i >= 0) this.draft.stationCodes.splice(i, 1);
    else this.draft.stationCodes.push(code);
  }
  isStationSelected(code: string): boolean {
    return this.draft.stationCodes.includes(code);
  }

  toggleDay(day: WeekDay): void {
    const i = this.draft.allowedDays.indexOf(day);
    if (i >= 0) this.draft.allowedDays.splice(i, 1);
    else this.draft.allowedDays.push(day);
  }
  isDaySelected(day: WeekDay): boolean {
    return this.draft.allowedDays.includes(day);
  }

  private isValidPhone(phone: string): boolean {
    return /^\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test((phone || '').trim());
  }

  createVoucher(): void {
    this.formTouched = true;
    this.validationErrors = [];
    const d = this.draft;

    if (!d.driverName || d.driverName.trim().length < 2) {
      this.validationErrors.push('Driver name must be at least 2 characters');
    }
    if (!this.isValidPhone(d.driverPhone)) {
      this.validationErrors.push('A valid driver phone number is required (e.g. +974-XXXX-XXXX)');
    }
    if (!d.amount || d.amount <= 0) {
      this.validationErrors.push('Voucher amount must be greater than 0');
    }
    if (!d.expiryDate) {
      this.validationErrors.push('An expiry date is required');
    } else if (new Date(d.expiryDate + 'T23:59:59').getTime() < Date.now()) {
      this.validationErrors.push('Expiry date must be in the future');
    }
    // Limit sanity: caps should not exceed the voucher amount.
    (['dailyLimit', 'weeklyLimit', 'monthlyLimit'] as const).forEach((k) => {
      const val = d[k];
      if (val != null && val < 0) this.validationErrors.push(`${this.limitLabel(k)} cannot be negative`);
      if (val != null && d.amount && val > d.amount) {
        this.validationErrors.push(`${this.limitLabel(k)} cannot exceed the voucher amount`);
      }
    });

    if (this.validationErrors.length > 0) return;

    const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
    const veh = this.vehicles.find((x) => x.vehicleId === d.vehicleId);
    const voucher: Voucher = {
      voucherId: 'VCH-' + Date.now(),
      code: 'WQ-VCH-' + rand,
      qrToken: 'tkn_' + Math.random().toString(36).slice(2, 10),
      vehicleId: veh?.vehicleId,
      vehiclePlate: veh?.plateNo,
      driverName: d.driverName.trim(),
      driverPhone: d.driverPhone.trim(),
      amount: d.amount!,
      expiryDate: d.expiryDate,
      createdDate: new Date().toISOString(),
      baseStatus: 'Active',
      stationCodes: [...d.stationCodes],
      allowedDays: [...d.allowedDays],
      dailyLimit: d.dailyLimit ?? null,
      weeklyLimit: d.weeklyLimit ?? null,
      monthlyLimit: d.monthlyLimit ?? null,
      redemptions: [],
    };

    this.csp.saveVoucher(voucher);
    this.closeCreateModal();
    this.toast.success(`Voucher ${voucher.code} created and sent to ${voucher.driverName} via SMS.`);
    // Surface the dynamic QR / SMS link so the customer can review or resend it.
    this.openQrModal(voucher);
  }

  private limitLabel(k: 'dailyLimit' | 'weeklyLimit' | 'monthlyLimit'): string {
    return { dailyLimit: 'Daily limit', weeklyLimit: 'Weekly limit', monthlyLimit: 'Monthly limit' }[k];
  }

  // ---------- QR / SMS ----------
  openQrModal(v: Voucher): void {
    this.qrVoucher = v;
    this.showQrModal = true;
  }
  closeQrModal(): void {
    this.showQrModal = false;
    this.qrVoucher = null;
  }

  voucherLink(v: Voucher): string {
    return `https://csp.woqod.com.qa/v/${v.qrToken}`;
  }

  resendSms(v: Voucher): void {
    this.toast.success(`SMS with the voucher link re-sent to ${v.driverPhone}.`);
  }

  stationNames(v: Voucher): string {
    if (!v.stationCodes.length) return 'Any WOQOD station';
    return v.stationCodes
      .map((c) => this.stations.find((s) => s.code === c)?.name ?? c)
      .join(', ');
  }

  daysLabel(v: Voucher): string {
    return v.allowedDays.length ? v.allowedDays.join(', ') : 'Any day';
  }

  // ---------- demo: simulate a redemption so stats/reports come alive ----------
  simulateUse(v: Voucher): void {
    if (this.effectiveStatus(v) !== 'Active') {
      this.toast.error('Only active vouchers can be redeemed.');
      return;
    }
    const cap = v.dailyLimit ?? 250;
    const requested = Math.min(this.remaining(v), cap);
    if (requested <= 0) {
      this.toast.error('This voucher has no remaining balance.');
      return;
    }
    // Validate the redemption against the live credit-limit availability (credit is
    // only consumed at redemption, never reserved at issue).
    const available = this.availableCredit;
    if (available <= 0) {
      this.toast.error('Redemption declined — no credit limit available.');
      return;
    }
    const amount = Math.min(requested, available);
    const capped = amount < requested;
    const stationCode = v.stationCodes[0] ?? this.stations[0].code;
    const stationName = this.stations.find((s) => s.code === stationCode)?.name ?? stationCode;
    const updated: Voucher = {
      ...v,
      redemptions: [
        ...v.redemptions,
        { date: new Date().toISOString(), amount, stationCode, stationName },
      ],
    };
    this.csp.saveVoucher(updated);
    if (capped) {
      this.toast.info(`Redeemed ${amount.toLocaleString()} ${this.currency} at ${stationName} (capped by available credit limit).`);
    } else {
      this.toast.success(`Redeemed ${amount.toLocaleString()} ${this.currency} at ${stationName}.`);
    }
  }

  // ---------- cancel ----------
  requestCancel(v: Voucher): void {
    this.voucherToCancel = v;
    this.showCancelModal = true;
  }
  confirmCancel(): void {
    if (this.voucherToCancel) {
      this.csp.saveVoucher({ ...this.voucherToCancel, baseStatus: 'Cancelled' });
      this.toast.success(`Voucher ${this.voucherToCancel.code} cancelled. It can no longer be redeemed.`);
    }
    this.showCancelModal = false;
    this.voucherToCancel = null;
  }
  cancelCancel(): void {
    this.showCancelModal = false;
    this.voucherToCancel = null;
  }

  trackByVoucherId(_i: number, v: Voucher): string {
    return v.voucherId;
  }
}
