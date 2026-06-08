import { Injectable } from '@angular/core';

/** A bulk-fuel customer that already exists in WOQOD / ERP (for "Existing Customer" flows). */
export interface BulkFuelExistingCustomer {
  id: string;
  customerName: string;
  legalName: string;
  crNumber: string;
  classification: string;
  city: string;
  address1: string;
  poBox: string;
  mobile: string;
}

export interface BulkFuelTank {
  tankNo: string;
  capacity: number;
  site: string;
  status: 'Active' | 'Empty';
}

export interface BulkFuelContract {
  contractNo: string;
  customerName: string;
  product: string;
  site: string;
  minVolume: number;
  maxVolume: number;
  approvedQuantity: number;
  creditLimit: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Finished' | 'Terminated';
  tanks: BulkFuelTank[];
}

export interface BulkFuelInvoice {
  invoiceNo: string;
  contractNo: string;
  product: string;
  period: string;
  volume: number;
  amount: number;
  issuedDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface BulkFuelInspection {
  id: string;
  contractNo: string;
  site: string;
  tankNo: string;
  capacity: number;
  date: string;
  time: string;
  inspector: string;
  status: 'Scheduled' | 'Completed' | 'Due';
}

export interface BulkFuelApplication {
  referenceNumber: string;
  type: string;
  category?: string;
  applicantType?: string;
  submittedAt: string;
  status: string;
  validUntil?: string;
  data: any;
  documents?: { name: string; size: string }[];
}

const APPLICATIONS_KEY = 'bulkFuelApplications';

@Injectable({ providedIn: 'root' })
export class BulkFuelService {
  // ----- Mock reference data (would come from ERP/CMS in production) --------
  private readonly existingCustomers: BulkFuelExistingCustomer[] = [
    {
      id: 'CUST-BF-001', customerName: 'Qatar Construction & Trading Co.', legalName: 'Qatar Construction & Trading W.L.L.',
      crNumber: 'CR-44219', classification: 'Commercial Registration', city: 'Doha',
      address1: 'Salwa Road, Building 211', poBox: '23145', mobile: '+974-4412-9087',
    },
    {
      id: 'CUST-BF-002', customerName: 'Al Daayen Logistics Group', legalName: 'Al Daayen Logistics Group W.L.L.',
      crNumber: 'CR-55821', classification: 'Commercial Registration', city: 'Al Daayen',
      address1: 'Industrial Area, Street 41', poBox: '90123', mobile: '+974-5567-2210',
    },
    {
      id: 'CUST-BF-003', customerName: 'Lusail Facilities Management', legalName: 'Lusail FM W.L.L.',
      crNumber: 'CR-61200', classification: 'Free Zone', city: 'Lusail',
      address1: 'Marina District, Tower 7', poBox: '33781', mobile: '+974-3390-1123',
    },
  ];

  private readonly contracts: BulkFuelContract[] = [
    {
      contractNo: 'BF-CON-2025-0142', customerName: 'Qatar Construction & Trading Co.', product: 'Gasoil (Diesel)',
      site: 'Industrial Area — Plot 88', minVolume: 12000, maxVolume: 30000, approvedQuantity: 360000,
      creditLimit: 850000, startDate: '2025-01-15', endDate: '2026-01-14', status: 'Active',
      tanks: [
        { tankNo: 'TNK-001', capacity: 20000, site: 'Industrial Area — Plot 88', status: 'Active' },
        { tankNo: 'TNK-002', capacity: 10000, site: 'Industrial Area — Plot 88', status: 'Empty' },
      ],
    },
    {
      contractNo: 'BF-CON-2025-0167', customerName: 'Al Daayen Logistics Group', product: 'Premium (91 RON)',
      site: 'Al Daayen Depot Yard', minVolume: 8000, maxVolume: 18000, approvedQuantity: 200000,
      creditLimit: 540000, startDate: '2025-03-01', endDate: '2026-02-28', status: 'Active',
      tanks: [{ tankNo: 'TNK-101', capacity: 15000, site: 'Al Daayen Depot Yard', status: 'Active' }],
    },
    {
      contractNo: 'BF-CON-2024-0098', customerName: 'Lusail Facilities Management', product: 'Kerosene',
      site: 'Lusail Marina', minVolume: 3000, maxVolume: 7000, approvedQuantity: 84000,
      creditLimit: 210000, startDate: '2024-06-01', endDate: '2025-05-31', status: 'Finished',
      tanks: [{ tankNo: 'TNK-220', capacity: 8000, site: 'Lusail Marina', status: 'Empty' }],
    },
  ];

  private readonly invoices: BulkFuelInvoice[] = [
    { invoiceNo: 'INV-2026-0501', contractNo: 'BF-CON-2025-0142', product: 'Gasoil (Diesel)', period: 'May 2026', volume: 28500, amount: 71250, issuedDate: '2026-06-01', status: 'Pending' },
    { invoiceNo: 'INV-2026-0442', contractNo: 'BF-CON-2025-0142', product: 'Gasoil (Diesel)', period: 'Apr 2026', volume: 26100, amount: 65250, issuedDate: '2026-05-01', status: 'Paid' },
    { invoiceNo: 'INV-2026-0498', contractNo: 'BF-CON-2025-0167', product: 'Premium (91 RON)', period: 'May 2026', volume: 16200, amount: 48600, issuedDate: '2026-06-01', status: 'Overdue' },
    { invoiceNo: 'INV-2026-0439', contractNo: 'BF-CON-2025-0167', product: 'Premium (91 RON)', period: 'Apr 2026', volume: 15400, amount: 46200, issuedDate: '2026-05-01', status: 'Paid' },
  ];

  private readonly inspections: BulkFuelInspection[] = [
    { id: 'INS-001', contractNo: 'BF-CON-2025-0142', site: 'Industrial Area — Plot 88', tankNo: 'TNK-001', capacity: 20000, date: '2026-06-18', time: '09:00', inspector: 'Installations Officer', status: 'Scheduled' },
    { id: 'INS-002', contractNo: 'BF-CON-2025-0142', site: 'Industrial Area — Plot 88', tankNo: 'TNK-002', capacity: 10000, date: '2026-06-18', time: '11:00', inspector: 'Installations Officer', status: 'Scheduled' },
    { id: 'INS-003', contractNo: 'BF-CON-2025-0167', site: 'Al Daayen Depot Yard', tankNo: 'TNK-101', capacity: 15000, date: '2026-06-25', time: '10:30', inspector: 'Installations Assistant', status: 'Due' },
    { id: 'INS-004', contractNo: 'BF-CON-2024-0098', site: 'Lusail Marina', tankNo: 'TNK-220', capacity: 8000, date: '2026-03-12', time: '08:30', inspector: 'Installations Officer', status: 'Completed' },
  ];

  // ----- Accessors ----------------------------------------------------------
  getExistingCustomers(): BulkFuelExistingCustomer[] { return [...this.existingCustomers]; }
  getCustomerById(id: string): BulkFuelExistingCustomer | undefined {
    return this.existingCustomers.find((c) => c.id === id);
  }

  getContracts(): BulkFuelContract[] { return [...this.contracts]; }
  getActiveContracts(): BulkFuelContract[] { return this.contracts.filter((c) => c.status === 'Active'); }
  getContract(no: string): BulkFuelContract | undefined { return this.contracts.find((c) => c.contractNo === no); }

  getInvoices(contractNo?: string): BulkFuelInvoice[] {
    return contractNo ? this.invoices.filter((i) => i.contractNo === contractNo) : [...this.invoices];
  }

  getInspections(): BulkFuelInspection[] { return [...this.inspections]; }

  // ----- Applications (new / amend / terminate) -----------------------------
  listApplications(): BulkFuelApplication[] {
    try { return JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]'); }
    catch { return []; }
  }

  /** Persist an application and return the generated reference number. */
  saveApplication(app: Omit<BulkFuelApplication, 'referenceNumber' | 'submittedAt'> & { referenceNumber?: string }): string {
    const reference = app.referenceNumber || this.generateReference(app.type);
    const record: BulkFuelApplication = {
      ...app,
      referenceNumber: reference,
      submittedAt: new Date().toISOString(),
    };
    const list = this.listApplications();
    list.unshift(record);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(list));
    return reference;
  }

  /** Reference prefix per application type, e.g. BF-NC-20260607-1234. */
  generateReference(type: string): string {
    const prefix = this.prefixFor(type);
    const d = new Date();
    const stamp = `${d.getFullYear()}${this.pad(d.getMonth() + 1)}${this.pad(d.getDate())}`;
    const seq = Math.floor(1000 + Math.abs(Math.sin(d.getTime()) * 9000));
    return `${prefix}-${stamp}-${seq}`;
  }

  private prefixFor(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('terminat')) return 'BF-TR';
    if (t.includes('amend')) return 'BF-AM';
    if (t.includes('event')) return 'BF-EV';
    if (t.includes('semi')) return 'BF-SG';
    if (t.includes('government') || t.includes('gov')) return 'BF-GV';
    if (t.includes('existing')) return 'BF-EC';
    return 'BF-NC';
  }

  /** Deterministic decorative barcode (bar widths 1–3) from a reference string. */
  makeBarcode(ref: string): number[] {
    const bars: number[] = [];
    for (let i = 0; i < ref.length; i++) {
      const code = ref.charCodeAt(i);
      bars.push((code % 3) + 1, ((code >> 2) % 3) + 1, ((code >> 4) % 2) + 1);
    }
    return bars;
  }

  addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  private pad(n: number): string { return n < 10 ? '0' + n : '' + n; }
}
