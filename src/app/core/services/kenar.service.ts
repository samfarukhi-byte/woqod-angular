import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  TenantProfile,
  Shop,
  ShopDetail,
  Contract,
  RentInvoice,
  Cheque,
  UtilityBill,
  Payment,
  TenantDocument,
  TenantRequest,
  TenantNotification,
  Announcement,
  ReportConfig,
  DashboardSummary,
  ContractAlert,
  RequestSubmissionInput,
  SalesData,
  SalesDataSummary,
  SalesDataStatus,
  SalesDataSource,
  SalesUploadHistory,
  SalesDispute,
  PaymentMethodBreakdown,
} from '../../models/kenar.model';

const STORAGE_PREFIX = 'kenar';

@Injectable({ providedIn: 'root' })
export class KenarService {
  private readonly _tenantProfile$ = new BehaviorSubject<TenantProfile | null>(null);
  private readonly _shops$ = new BehaviorSubject<Shop[]>([]);
  private readonly _contracts$ = new BehaviorSubject<Contract[]>([]);
  private readonly _invoices$ = new BehaviorSubject<RentInvoice[]>([]);
  private readonly _cheques$ = new BehaviorSubject<Cheque[]>([]);
  private readonly _utilityBills$ = new BehaviorSubject<UtilityBill[]>([]);
  private readonly _payments$ = new BehaviorSubject<Payment[]>([]);
  private readonly _documents$ = new BehaviorSubject<TenantDocument[]>([]);
  private readonly _requests$ = new BehaviorSubject<TenantRequest[]>([]);
  private readonly _notifications$ = new BehaviorSubject<TenantNotification[]>([]);
  private readonly _announcements$ = new BehaviorSubject<Announcement[]>([]);
  private readonly _dashboardSummary$ = new BehaviorSubject<DashboardSummary | null>(null);
  private readonly _salesData$ = new BehaviorSubject<SalesData[]>([]);
  private readonly _salesSummary$ = new BehaviorSubject<SalesDataSummary | null>(null);
  private readonly _salesUploadHistory$ = new BehaviorSubject<SalesUploadHistory[]>([]);
  private readonly _salesDisputes$ = new BehaviorSubject<SalesDispute[]>([]);

  readonly tenantProfile$: Observable<TenantProfile | null> = this._tenantProfile$.asObservable();
  readonly shops$: Observable<Shop[]> = this._shops$.asObservable();
  readonly contracts$: Observable<Contract[]> = this._contracts$.asObservable();
  readonly invoices$: Observable<RentInvoice[]> = this._invoices$.asObservable();
  readonly cheques$: Observable<Cheque[]> = this._cheques$.asObservable();
  readonly utilityBills$: Observable<UtilityBill[]> = this._utilityBills$.asObservable();
  readonly payments$: Observable<Payment[]> = this._payments$.asObservable();
  readonly documents$: Observable<TenantDocument[]> = this._documents$.asObservable();
  readonly requests$: Observable<TenantRequest[]> = this._requests$.asObservable();
  readonly notifications$: Observable<TenantNotification[]> = this._notifications$.asObservable();
  readonly announcements$: Observable<Announcement[]> = this._announcements$.asObservable();
  readonly dashboardSummary$: Observable<DashboardSummary | null> = this._dashboardSummary$.asObservable();
  readonly salesData$: Observable<SalesData[]> = this._salesData$.asObservable();
  readonly salesSummary$: Observable<SalesDataSummary | null> = this._salesSummary$.asObservable();
  readonly salesUploadHistory$: Observable<SalesUploadHistory[]> = this._salesUploadHistory$.asObservable();
  readonly salesDisputes$: Observable<SalesDispute[]> = this._salesDisputes$.asObservable();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    this._tenantProfile$.next(this.getMockTenantProfile());
    this._shops$.next(this.getMockShops());
    this._contracts$.next(this.getMockContracts());
    this._invoices$.next(this.getMockInvoices());
    this._cheques$.next(this.getMockCheques());
    this._utilityBills$.next(this.getMockUtilityBills());
    this._payments$.next(this.getMockPayments());
    this._documents$.next(this.getMockDocuments());
    this._requests$.next(this.getMockRequests());
    this._notifications$.next(this.getMockNotifications());
    this._announcements$.next(this.getMockAnnouncements());
    this._dashboardSummary$.next(this.calculateDashboardSummary());
    this._salesData$.next(this.getMockSalesData());
    this._salesSummary$.next(this.getMockSalesSummary());
    this._salesUploadHistory$.next(this.getMockUploadHistory());
    this._salesDisputes$.next(this.getMockSalesDisputes());
  }

  // ----- Tenant Profile -----
  getTenantProfile(): TenantProfile | null {
    return this._tenantProfile$.value;
  }

  private getMockTenantProfile(): TenantProfile {
    return {
      tenantId: 'TNT-001',
      tenantCode: 'TC-2024-001',
      tenantName: 'Al Noor Trading & Retail LLC',
      commercialRegistrationNumber: 'CR-123456789',
      contactPerson: 'Ahmed Al Kuwari',
      mobileNumber: '+974 5555 1234',
      email: 'ahmed.alkuwari@alnoortrading.qa',
      registeredAddress: 'Building 45, Zone 23, Al Sadd, Doha, Qatar',
      accountStatus: 'Active',
      linkedShopsCount: 5,
      createdDate: '2020-03-15',
    };
  }

  // ----- Shops -----
  getShops(): Shop[] {
    return this._shops$.value;
  }

  getShopDetails(shopId: string): ShopDetail | null {
    const shop = this._shops$.value.find((s) => s.shopId === shopId);
    if (!shop) return null;

    return {
      ...shop,
      contractStartDate: '2023-01-01',
      contractEndDate: '2026-12-31',
      securityDeposit: shop.rentAmount * 3,
      paymentFrequency: 'Monthly',
      utilityMeterDetails: {
        electricityMeter: 'ELEC-' + shop.shopCode,
        waterMeter: 'WATER-' + shop.shopCode,
        coolingMeter: 'COOL-' + shop.shopCode,
      },
      permittedBusinessActivity: 'Retail Convenience Store',
      woqodContactPerson: 'Khalid Al Thani (Station Manager)',
      activeRequestsCount: 1,
    };
  }

  private getMockShops(): Shop[] {
    return [
      {
        shopId: 'SHP-001',
        shopCode: 'WS-001-A',
        stationName: 'WOQOD Al Sadd Station',
        stationCode: 'WQD-AS-001',
        location: 'Al Sadd, Doha',
        shopType: 'Convenience Store',
        shopSize: 45,
        contractStatus: 'Active',
        rentAmount: 12000,
        operationalStatus: 'Operational',
        contractReference: 'CNT-2023-001',
      },
      {
        shopId: 'SHP-002',
        shopCode: 'WS-002-B',
        stationName: 'WOQOD Corniche Station',
        stationCode: 'WQD-COR-002',
        location: 'Corniche, Doha',
        shopType: 'Coffee Shop',
        shopSize: 30,
        contractStatus: 'Active',
        rentAmount: 15000,
        operationalStatus: 'Operational',
        contractReference: 'CNT-2023-002',
      },
      {
        shopId: 'SHP-003',
        shopCode: 'WS-003-C',
        stationName: 'WOQOD Industrial Area',
        stationCode: 'WQD-IA-003',
        location: 'Industrial Area, Doha',
        shopType: 'Car Wash',
        shopSize: 120,
        contractStatus: 'Active',
        rentAmount: 18000,
        operationalStatus: 'Operational',
        contractReference: 'CNT-2022-003',
      },
      {
        shopId: 'SHP-004',
        shopCode: 'WS-004-D',
        stationName: 'WOQOD Al Wakrah',
        stationCode: 'WQD-AW-004',
        location: 'Al Wakrah',
        shopType: 'Quick Service Restaurant',
        shopSize: 55,
        contractStatus: 'Expiring Soon',
        rentAmount: 20000,
        operationalStatus: 'Operational',
        contractReference: 'CNT-2021-004',
      },
      {
        shopId: 'SHP-005',
        shopCode: 'WS-005-E',
        stationName: 'WOQOD Lusail',
        stationCode: 'WQD-LS-005',
        location: 'Lusail City',
        shopType: 'Retail Store',
        shopSize: 60,
        contractStatus: 'Active',
        rentAmount: 25000,
        operationalStatus: 'Under Maintenance',
        contractReference: 'CNT-2024-005',
      },
    ];
  }

  // ----- Contracts -----
  getContracts(): Contract[] {
    return this._contracts$.value;
  }

  private getMockContracts(): Contract[] {
    return [
      {
        contractId: 'CNT-001',
        contractNumber: 'CNT-2023-001',
        shopCode: 'WS-001-A',
        shopName: 'Al Sadd Convenience Store',
        stationName: 'WOQOD Al Sadd Station',
        startDate: '2023-01-01',
        endDate: '2026-12-31',
        rentValue: 432000,
        paymentTerms: 'Monthly in advance',
        securityDeposit: 36000,
        contractStatus: 'Active',
        daysUntilExpiry: 587,
      },
      {
        contractId: 'CNT-002',
        contractNumber: 'CNT-2023-002',
        shopCode: 'WS-002-B',
        shopName: 'Corniche Coffee Shop',
        stationName: 'WOQOD Corniche Station',
        startDate: '2023-03-01',
        endDate: '2027-02-28',
        rentValue: 540000,
        paymentTerms: 'Monthly in advance',
        securityDeposit: 45000,
        contractStatus: 'Active',
        daysUntilExpiry: 647,
      },
      {
        contractId: 'CNT-003',
        contractNumber: 'CNT-2022-003',
        shopCode: 'WS-003-C',
        shopName: 'Industrial Car Wash',
        stationName: 'WOQOD Industrial Area',
        startDate: '2022-06-01',
        endDate: '2025-05-31',
        rentValue: 648000,
        paymentTerms: 'Quarterly in advance',
        securityDeposit: 54000,
        contractStatus: 'Active',
        daysUntilExpiry: 373,
      },
      {
        contractId: 'CNT-004',
        contractNumber: 'CNT-2021-004',
        shopCode: 'WS-004-D',
        shopName: 'Al Wakrah QSR',
        stationName: 'WOQOD Al Wakrah',
        startDate: '2021-09-01',
        endDate: '2025-08-31',
        rentValue: 720000,
        paymentTerms: 'Monthly in advance',
        securityDeposit: 60000,
        contractStatus: 'Expiring Soon',
        renewalStatus: 'Pending',
        daysUntilExpiry: 465,
      },
      {
        contractId: 'CNT-005',
        contractNumber: 'CNT-2024-005',
        shopCode: 'WS-005-E',
        shopName: 'Lusail Retail Store',
        stationName: 'WOQOD Lusail',
        startDate: '2024-01-01',
        endDate: '2029-12-31',
        rentValue: 900000,
        paymentTerms: 'Monthly in advance',
        securityDeposit: 75000,
        contractStatus: 'Active',
        daysUntilExpiry: 1318,
      },
    ];
  }

  // ----- Invoices -----
  getInvoices(): RentInvoice[] {
    return this._invoices$.value;
  }

  private getMockInvoices(): RentInvoice[] {
    return [
      {
        invoiceId: 'INV-001',
        invoiceNumber: 'RENT-2026-05-001',
        billingPeriod: 'May 2026',
        shopCode: 'WS-001-A',
        contractReference: 'CNT-2023-001',
        dueDate: '2026-05-05',
        rentAmount: 12000,
        paidAmount: 12000,
        outstandingAmount: 0,
        paymentStatus: 'Paid',
        issueDate: '2026-04-25',
      },
      {
        invoiceId: 'INV-002',
        invoiceNumber: 'RENT-2026-05-002',
        billingPeriod: 'May 2026',
        shopCode: 'WS-002-B',
        contractReference: 'CNT-2023-002',
        dueDate: '2026-05-05',
        rentAmount: 15000,
        paidAmount: 15000,
        outstandingAmount: 0,
        paymentStatus: 'Paid',
        issueDate: '2026-04-25',
      },
      {
        invoiceId: 'INV-003',
        invoiceNumber: 'RENT-2026-06-001',
        billingPeriod: 'June 2026',
        shopCode: 'WS-001-A',
        contractReference: 'CNT-2023-001',
        dueDate: '2026-06-05',
        rentAmount: 12000,
        paidAmount: 0,
        outstandingAmount: 12000,
        paymentStatus: 'Pending',
        issueDate: '2026-05-22',
      },
      {
        invoiceId: 'INV-004',
        invoiceNumber: 'RENT-2026-06-002',
        billingPeriod: 'June 2026',
        shopCode: 'WS-002-B',
        contractReference: 'CNT-2023-002',
        dueDate: '2026-06-05',
        rentAmount: 15000,
        paidAmount: 0,
        outstandingAmount: 15000,
        paymentStatus: 'Pending',
        issueDate: '2026-05-22',
      },
      {
        invoiceId: 'INV-005',
        invoiceNumber: 'RENT-2026-04-003',
        billingPeriod: 'April 2026',
        shopCode: 'WS-004-D',
        contractReference: 'CNT-2021-004',
        dueDate: '2026-04-05',
        rentAmount: 20000,
        paidAmount: 10000,
        outstandingAmount: 10000,
        paymentStatus: 'Partially Paid',
        issueDate: '2026-03-25',
      },
      {
        invoiceId: 'INV-006',
        invoiceNumber: 'RENT-2026-03-005',
        billingPeriod: 'March 2026',
        shopCode: 'WS-005-E',
        contractReference: 'CNT-2024-005',
        dueDate: '2026-03-05',
        rentAmount: 25000,
        paidAmount: 0,
        outstandingAmount: 25000,
        paymentStatus: 'Overdue',
        issueDate: '2026-02-22',
      },
    ];
  }

  // ----- Cheques -----
  getCheques(): Cheque[] {
    return this._cheques$.value;
  }

  private getMockCheques(): Cheque[] {
    return [
      {
        chequeId: 'CHQ-001',
        chequeNumber: '123456',
        bankName: 'Qatar National Bank',
        chequeDate: '2026-06-01',
        amount: 12000,
        contractReference: 'CNT-2023-001',
        shopCode: 'WS-001-A',
        status: 'Submitted',
        submittedDate: '2026-05-15',
      },
      {
        chequeId: 'CHQ-002',
        chequeNumber: '123457',
        bankName: 'Commercial Bank of Qatar',
        chequeDate: '2026-06-01',
        amount: 15000,
        contractReference: 'CNT-2023-002',
        shopCode: 'WS-002-B',
        status: 'Deposited',
        submittedDate: '2026-05-15',
      },
      {
        chequeId: 'CHQ-003',
        chequeNumber: '123458',
        bankName: 'Doha Bank',
        chequeDate: '2026-05-01',
        amount: 18000,
        contractReference: 'CNT-2022-003',
        shopCode: 'WS-003-C',
        status: 'Cleared',
        submittedDate: '2026-04-15',
      },
      {
        chequeId: 'CHQ-004',
        chequeNumber: '123459',
        bankName: 'Qatar Islamic Bank',
        chequeDate: '2026-04-01',
        amount: 20000,
        contractReference: 'CNT-2021-004',
        shopCode: 'WS-004-D',
        status: 'Bounced',
        remarks: 'Insufficient funds',
        submittedDate: '2026-03-15',
      },
      {
        chequeId: 'CHQ-005',
        chequeNumber: '123460',
        bankName: 'Qatar National Bank',
        chequeDate: '2026-07-01',
        amount: 25000,
        contractReference: 'CNT-2024-005',
        shopCode: 'WS-005-E',
        status: 'Pending Deposit',
        submittedDate: '2026-05-20',
      },
    ];
  }

  // ----- Utility Bills -----
  getUtilityBills(): UtilityBill[] {
    return this._utilityBills$.value;
  }

  private getMockUtilityBills(): UtilityBill[] {
    return [
      {
        billId: 'UTIL-001',
        billNumber: 'ELEC-2026-05-001',
        shopCode: 'WS-001-A',
        stationName: 'WOQOD Al Sadd Station',
        billingPeriod: 'May 2026',
        utilityType: 'Electricity',
        previousReading: 1250,
        currentReading: 1580,
        consumption: 330,
        amount: 825,
        dueDate: '2026-06-10',
        paymentStatus: 'Pending',
        issueDate: '2026-05-20',
      },
      {
        billId: 'UTIL-002',
        billNumber: 'WATER-2026-05-001',
        shopCode: 'WS-001-A',
        stationName: 'WOQOD Al Sadd Station',
        billingPeriod: 'May 2026',
        utilityType: 'Water',
        previousReading: 450,
        currentReading: 485,
        consumption: 35,
        amount: 175,
        dueDate: '2026-06-10',
        paymentStatus: 'Pending',
        issueDate: '2026-05-20',
      },
      {
        billId: 'UTIL-003',
        billNumber: 'ELEC-2026-04-002',
        shopCode: 'WS-002-B',
        stationName: 'WOQOD Corniche Station',
        billingPeriod: 'April 2026',
        utilityType: 'Electricity',
        previousReading: 2100,
        currentReading: 2450,
        consumption: 350,
        amount: 875,
        dueDate: '2026-05-10',
        paymentStatus: 'Paid',
        issueDate: '2026-04-20',
      },
      {
        billId: 'UTIL-004',
        billNumber: 'COOL-2026-05-003',
        shopCode: 'WS-003-C',
        stationName: 'WOQOD Industrial Area',
        billingPeriod: 'May 2026',
        utilityType: 'Cooling',
        previousReading: 3200,
        currentReading: 3650,
        consumption: 450,
        amount: 1800,
        dueDate: '2026-06-10',
        paymentStatus: 'Pending',
        issueDate: '2026-05-20',
      },
      {
        billId: 'UTIL-005',
        billNumber: 'CAM-2026-05-004',
        shopCode: 'WS-004-D',
        stationName: 'WOQOD Al Wakrah',
        billingPeriod: 'May 2026',
        utilityType: 'Common Area Maintenance',
        previousReading: 0,
        currentReading: 0,
        consumption: 0,
        amount: 500,
        dueDate: '2026-03-10',
        paymentStatus: 'Overdue',
        issueDate: '2026-02-20',
      },
    ];
  }

  // ----- Payments -----
  getPayments(): Payment[] {
    return this._payments$.value;
  }

  private getMockPayments(): Payment[] {
    return [
      {
        paymentId: 'PAY-001',
        paymentDate: '2026-05-03',
        amountPaid: 12000,
        paymentMode: 'Cheque',
        chequeNumber: '123456',
        bankReference: 'QNB-REF-001',
        invoiceAdjusted: 'RENT-2026-05-001',
        receiptNumber: 'RCP-2026-001',
        paymentStatus: 'Completed',
      },
      {
        paymentId: 'PAY-002',
        paymentDate: '2026-05-04',
        amountPaid: 15000,
        paymentMode: 'Bank Transfer',
        bankReference: 'CBQ-TRF-002',
        invoiceAdjusted: 'RENT-2026-05-002',
        receiptNumber: 'RCP-2026-002',
        paymentStatus: 'Completed',
      },
      {
        paymentId: 'PAY-003',
        paymentDate: '2026-04-25',
        amountPaid: 875,
        paymentMode: 'Online Payment',
        bankReference: 'OPN-003',
        invoiceAdjusted: 'ELEC-2026-04-002',
        receiptNumber: 'RCP-2026-003',
        paymentStatus: 'Completed',
      },
      {
        paymentId: 'PAY-004',
        paymentDate: '2026-04-15',
        amountPaid: 10000,
        paymentMode: 'Cheque',
        chequeNumber: '123461',
        bankReference: 'QIB-REF-004',
        invoiceAdjusted: 'RENT-2026-04-003',
        receiptNumber: 'RCP-2026-004',
        paymentStatus: 'Completed',
      },
    ];
  }

  // ----- Documents -----
  getDocuments(): TenantDocument[] {
    return this._documents$.value;
  }

  uploadDocument(doc: Partial<TenantDocument>): void {
    const newDoc: TenantDocument = {
      documentId: 'DOC-' + Date.now(),
      documentName: doc.documentName || 'Untitled',
      documentType: doc.documentType || 'Other',
      relatedShop: doc.relatedShop,
      expiryDate: doc.expiryDate,
      status: 'Submitted',
      uploadedDate: new Date().toISOString(),
    };
    const docs = [...this._documents$.value, newDoc];
    this._documents$.next(docs);
    this.saveToStorage('documents', docs);
  }

  private getMockDocuments(): TenantDocument[] {
    return [
      {
        documentId: 'DOC-001',
        documentName: 'Commercial Registration Certificate',
        documentType: 'Commercial Registration',
        status: 'Approved',
        uploadedDate: '2024-01-15',
        expiryDate: '2027-01-15',
      },
      {
        documentId: 'DOC-002',
        documentName: 'Trade License Copy',
        documentType: 'Trade License',
        relatedShop: 'WS-001-A',
        status: 'Approved',
        uploadedDate: '2024-01-15',
        expiryDate: '2026-12-31',
      },
      {
        documentId: 'DOC-003',
        documentName: 'QID - Ahmed Al Kuwari',
        documentType: 'QID Copy',
        status: 'Approved',
        uploadedDate: '2024-01-15',
        expiryDate: '2028-06-30',
      },
      {
        documentId: 'DOC-004',
        documentName: 'Insurance Certificate - Lusail Shop',
        documentType: 'Insurance Certificate',
        relatedShop: 'WS-005-E',
        status: 'Renewal Required',
        uploadedDate: '2024-01-10',
        expiryDate: '2026-06-01',
      },
      {
        documentId: 'DOC-005',
        documentName: 'Municipality License - Al Wakrah',
        documentType: 'Municipality License',
        relatedShop: 'WS-004-D',
        status: 'Under Review',
        uploadedDate: '2026-05-10',
      },
      {
        documentId: 'DOC-006',
        documentName: 'Food Safety Approval',
        documentType: 'Food Safety Approval',
        relatedShop: 'WS-002-B',
        status: 'Rejected',
        uploadedDate: '2026-04-15',
        rejectionReason: 'Document not clear, please upload a scanned copy',
      },
    ];
  }

  // ----- Requests -----
  getRequests(): TenantRequest[] {
    return this._requests$.value;
  }

  submitRequest(input: RequestSubmissionInput): void {
    const newRequest: TenantRequest = {
      requestId: 'REQ-' + Date.now(),
      requestNumber: 'KNR-REQ-' + new Date().getFullYear() + '-' + String(this._requests$.value.length + 1).padStart(4, '0'),
      requestType: input.requestType as any,
      relatedShop: input.relatedShop,
      subject: input.subject,
      description: input.description,
      priority: input.priority,
      submittedDate: new Date().toISOString(),
      status: 'Submitted',
      lastUpdated: new Date().toISOString(),
    };
    const requests = [...this._requests$.value, newRequest];
    this._requests$.next(requests);
    this.saveToStorage('requests', requests);
  }

  private getMockRequests(): TenantRequest[] {
    return [
      {
        requestId: 'REQ-001',
        requestNumber: 'KNR-REQ-2026-0001',
        requestType: 'Shop Maintenance',
        relatedShop: 'WS-005-E',
        subject: 'AC Unit Repair Required',
        description: 'The main AC unit in Lusail shop is not cooling properly. Immediate attention needed.',
        priority: 'High',
        submittedDate: '2026-05-20T10:30:00',
        status: 'In Progress',
        lastUpdated: '2026-05-22T14:15:00',
        assignedDepartment: 'Facilities Management',
        responseNotes: 'Technician scheduled for site visit on May 24, 2026',
      },
      {
        requestId: 'REQ-002',
        requestNumber: 'KNR-REQ-2026-0002',
        requestType: 'Contract Renewal',
        relatedShop: 'WS-004-D',
        subject: 'Early Renewal Request',
        description: 'We would like to renew our contract for Al Wakrah shop 6 months before expiry.',
        priority: 'Medium',
        submittedDate: '2026-05-18T09:00:00',
        status: 'Under Review',
        lastUpdated: '2026-05-19T11:00:00',
        assignedDepartment: 'Contracts Department',
      },
      {
        requestId: 'REQ-003',
        requestNumber: 'KNR-REQ-2026-0003',
        requestType: 'Utility Bill Dispute',
        relatedShop: 'WS-003-C',
        subject: 'High Cooling Charges',
        description: 'The cooling charges for May 2026 seem unusually high. Please review meter reading.',
        priority: 'Medium',
        submittedDate: '2026-05-21T13:45:00',
        status: 'Submitted',
        lastUpdated: '2026-05-21T13:45:00',
        assignedDepartment: 'Billing Department',
      },
      {
        requestId: 'REQ-004',
        requestNumber: 'KNR-REQ-2026-0004',
        requestType: 'Signage Approval',
        relatedShop: 'WS-001-A',
        subject: 'New Brand Signage Installation',
        description: 'Requesting approval for new LED signage installation at Al Sadd shop.',
        priority: 'Low',
        submittedDate: '2026-05-15T16:20:00',
        status: 'Completed',
        lastUpdated: '2026-05-19T10:30:00',
        assignedDepartment: 'Marketing & Branding',
        responseNotes: 'Signage design approved. Installation can proceed.',
      },
      {
        requestId: 'REQ-005',
        requestNumber: 'KNR-REQ-2026-0005',
        requestType: 'Complaint',
        relatedShop: 'WS-002-B',
        subject: 'Water Supply Interruption',
        description: 'Frequent water supply interruptions affecting business operations at Corniche shop.',
        priority: 'Urgent',
        submittedDate: '2026-05-22T08:00:00',
        status: 'Pending WOQOD Approval',
        lastUpdated: '2026-05-23T09:00:00',
        assignedDepartment: 'Operations',
        responseNotes: 'Escalated to station manager. Plumbing team to investigate.',
      },
    ];
  }

  // ----- Notifications -----
  getNotifications(): TenantNotification[] {
    return this._notifications$.value;
  }

  markNotificationAsRead(notificationId: string): void {
    const notifications = this._notifications$.value.map((n) =>
      n.notificationId === notificationId ? { ...n, isRead: true } : n
    );
    this._notifications$.next(notifications);
    this.saveToStorage('notifications', notifications);
  }

  markAllNotificationsAsRead(): void {
    const notifications = this._notifications$.value.map((n) => ({ ...n, isRead: true }));
    this._notifications$.next(notifications);
    this.saveToStorage('notifications', notifications);
  }

  private getMockNotifications(): TenantNotification[] {
    return [
      {
        notificationId: 'NOT-001',
        title: 'Rent Payment Due',
        message: 'Your rent payment for June 2026 is due on June 5, 2026 for shop WS-001-A.',
        type: 'Rent Payment Due',
        relatedEntity: { type: 'invoice', id: 'INV-003' },
        createdDate: '2026-05-22T09:00:00',
        isRead: false,
        priority: 'High',
      },
      {
        notificationId: 'NOT-002',
        title: 'Request Status Updated',
        message: 'Your maintenance request KNR-REQ-2026-0001 status changed to "In Progress".',
        type: 'Request Updated',
        relatedEntity: { type: 'request', id: 'REQ-001' },
        createdDate: '2026-05-22T14:15:00',
        isRead: false,
        priority: 'Medium',
      },
      {
        notificationId: 'NOT-003',
        title: 'Utility Bill Generated',
        message: 'New electricity bill generated for shop WS-001-A. Amount: QAR 825.00',
        type: 'Utility Bill Generated',
        relatedEntity: { type: 'invoice', id: 'UTIL-001' },
        createdDate: '2026-05-20T12:00:00',
        isRead: true,
        priority: 'Medium',
      },
      {
        notificationId: 'NOT-004',
        title: 'Cheque Bounced',
        message: 'Cheque #123459 for shop WS-004-D has bounced. Reason: Insufficient funds.',
        type: 'Cheque Bounced',
        relatedEntity: { type: 'cheque', id: 'CHQ-004' },
        createdDate: '2026-04-10T10:30:00',
        isRead: false,
        priority: 'High',
      },
      {
        notificationId: 'NOT-005',
        title: 'Document Expiring Soon',
        message: 'Your Insurance Certificate for shop WS-005-E expires on June 1, 2026.',
        type: 'Document Expiring',
        relatedEntity: { type: 'document', id: 'DOC-004' },
        createdDate: '2026-05-15T08:00:00',
        isRead: true,
        priority: 'Medium',
      },
      {
        notificationId: 'NOT-006',
        title: 'WOQOD Announcement',
        message: 'New payment portal features available. Check announcements for details.',
        type: 'WOQOD Announcement',
        createdDate: '2026-05-10T09:00:00',
        isRead: true,
        priority: 'Low',
      },
      {
        notificationId: 'NOT-007',
        title: 'Maintenance Scheduled',
        message: 'Scheduled maintenance at WOQOD Lusail station on May 24, 2026 from 2-4 PM.',
        type: 'Maintenance Scheduled',
        relatedEntity: { type: 'shop', id: 'SHP-005' },
        createdDate: '2026-05-18T11:00:00',
        isRead: false,
        priority: 'Medium',
      },
    ];
  }

  // ----- Announcements -----
  getAnnouncements(): Announcement[] {
    return this._announcements$.value;
  }

  private getMockAnnouncements(): Announcement[] {
    return [
      {
        announcementId: 'ANN-001',
        title: 'New Online Payment Portal Launched',
        description: 'WOQOD is pleased to announce the launch of our new online payment portal. Tenants can now pay rent and utility bills online using credit/debit cards or bank transfers. Visit the Payments section to explore this feature.',
        publishedDate: '2026-05-10T09:00:00',
        category: 'Payment',
        priority: 'High',
      },
      {
        announcementId: 'ANN-002',
        title: 'Summer Maintenance Schedule',
        description: 'All stations will undergo routine maintenance during June-July 2026. Tenants will be notified 48 hours before any scheduled maintenance at their station.',
        publishedDate: '2026-05-05T10:00:00',
        category: 'Maintenance',
        priority: 'Medium',
      },
      {
        announcementId: 'ANN-003',
        title: 'Updated Fire Safety Regulations',
        description: 'Ministry of Interior has updated fire safety regulations for retail outlets. All tenants must ensure compliance by August 1, 2026. Contact your station manager for guidance.',
        publishedDate: '2026-04-28T14:00:00',
        category: 'Safety Instruction',
        priority: 'High',
      },
      {
        announcementId: 'ANN-004',
        title: 'Contract Renewal Process Update',
        description: 'The contract renewal process has been streamlined. Tenants can now submit renewal requests online 6 months before expiry. Processing time reduced to 30 days.',
        publishedDate: '2026-04-20T11:00:00',
        category: 'Contract',
        priority: 'Medium',
      },
      {
        announcementId: 'ANN-005',
        title: 'Eid Al Adha Holiday Hours',
        description: 'WOQOD offices will be closed from June 15-19, 2026 for Eid Al Adha holidays. Emergency contacts will remain available 24/7.',
        publishedDate: '2026-05-01T09:00:00',
        category: 'General',
        priority: 'Low',
      },
    ];
  }

  // ----- Reports -----
  getReportConfigs(): ReportConfig[] {
    return [
      {
        reportId: 'RPT-001',
        reportName: 'Statement of Account',
        reportType: 'Statement of Account',
        description: 'Comprehensive account statement showing all transactions',
        availableFilters: ['Date Range', 'Shop', 'Transaction Type'],
      },
      {
        reportId: 'RPT-002',
        reportName: 'Rent Payment Report',
        reportType: 'Rent Payment Report',
        description: 'Detailed rent payment history',
        availableFilters: ['Date Range', 'Shop', 'Payment Status'],
      },
      {
        reportId: 'RPT-003',
        reportName: 'Outstanding Balance Report',
        reportType: 'Outstanding Balance Report',
        description: 'Current outstanding balances across all shops',
        availableFilters: ['Shop', 'Age of Outstanding'],
      },
      {
        reportId: 'RPT-004',
        reportName: 'Utility Bill Report',
        reportType: 'Utility Bill Report',
        description: 'Utility consumption and billing report',
        availableFilters: ['Date Range', 'Shop', 'Utility Type'],
      },
      {
        reportId: 'RPT-005',
        reportName: 'Cheque Status Report',
        reportType: 'Cheque Status Report',
        description: 'Status of all submitted cheques',
        availableFilters: ['Date Range', 'Shop', 'Cheque Status'],
      },
      {
        reportId: 'RPT-006',
        reportName: 'Shop List Report',
        reportType: 'Shop List Report',
        description: 'Complete list of all rented shops with details',
        availableFilters: ['Station', 'Shop Type', 'Status'],
      },
      {
        reportId: 'RPT-007',
        reportName: 'Contract Summary Report',
        reportType: 'Contract Summary Report',
        description: 'Summary of all active contracts',
        availableFilters: ['Contract Status', 'Expiry Date'],
      },
      {
        reportId: 'RPT-008',
        reportName: 'Document Expiry Report',
        reportType: 'Document Expiry Report',
        description: 'Documents expiring in the next 90 days',
        availableFilters: ['Document Type', 'Shop'],
      },
      {
        reportId: 'RPT-009',
        reportName: 'Request History Report',
        reportType: 'Request History Report',
        description: 'Complete history of all requests and complaints',
        availableFilters: ['Date Range', 'Request Type', 'Status'],
      },
    ];
  }

  // ----- Dashboard -----
  getDashboardSummary(): DashboardSummary | null {
    return this._dashboardSummary$.value;
  }

  private calculateDashboardSummary(): DashboardSummary {
    const shops = this._shops$.value;
    const contracts = this._contracts$.value;
    const invoices = this._invoices$.value;
    const cheques = this._cheques$.value;
    const utilityBills = this._utilityBills$.value;
    const requests = this._requests$.value;
    const notifications = this._notifications$.value;

    return {
      totalShops: shops.length,
      activeContracts: contracts.filter((c) => c.contractStatus === 'Active').length,
      expiringContracts: contracts.filter((c) => c.contractStatus === 'Expiring Soon').length,
      outstandingRent: invoices.filter((i) => i.paymentStatus !== 'Paid').reduce((sum, i) => sum + i.outstandingAmount, 0),
      utilityBillsDue: utilityBills.filter((b) => b.paymentStatus === 'Pending').length,
      upcomingCheques: cheques.filter((c) => c.status === 'Submitted' || c.status === 'Pending Deposit').length,
      pendingRequests: requests.filter((r) => r.status !== 'Completed' && r.status !== 'Closed' && r.status !== 'Rejected').length,
      unreadNotifications: notifications.filter((n) => !n.isRead).length,
    };
  }

  getContractAlerts(): ContractAlert[] {
    const today = new Date();
    return this._contracts$.value
      .filter((c) => c.daysUntilExpiry && c.daysUntilExpiry < 180)
      .map((c) => ({
        contractId: c.contractId,
        contractNumber: c.contractNumber,
        shopName: c.shopName,
        alertType: c.daysUntilExpiry! < 0 ? 'Expired' : c.daysUntilExpiry! < 90 ? 'Expiring Soon' : 'Renewal Due',
        expiryDate: c.endDate,
        daysRemaining: c.daysUntilExpiry!,
        severity: c.daysUntilExpiry! < 30 ? 'High' : c.daysUntilExpiry! < 90 ? 'Medium' : 'Low',
      }));
  }

  // ----- Sales Data Management -----
  getSalesData(filters?: { startDate?: string; endDate?: string; shopCode?: string; status?: string }): SalesData[] {
    let data = this._salesData$.value;

    if (filters) {
      if (filters.startDate) {
        data = data.filter((s) => s.salesDate >= filters.startDate!);
      }
      if (filters.endDate) {
        data = data.filter((s) => s.salesDate <= filters.endDate!);
      }
      if (filters.shopCode) {
        data = data.filter((s) => s.shopCode === filters.shopCode);
      }
      if (filters.status) {
        data = data.filter((s) => s.processingStatus === filters.status);
      }
    }

    return data;
  }

  getSalesSummary(): SalesDataSummary | null {
    return this._salesSummary$.value;
  }

  uploadSalesFile(file: File, shopCode: string): void {
    // Mock file upload
    const uploadRecord: SalesUploadHistory = {
      uploadId: 'UPLOAD-' + Date.now(),
      fileName: file.name,
      uploadDate: new Date().toISOString(),
      fileSize: file.size,
      recordsCount: Math.floor(Math.random() * 30) + 1,
      status: 'Under Processing',
      processedRecords: 0,
      failedRecords: 0,
    };

    const history = [uploadRecord, ...this._salesUploadHistory$.value];
    this._salesUploadHistory$.next(history);
    this.saveToStorage('salesUploadHistory', history);

    // Simulate processing after a delay
    setTimeout(() => {
      uploadRecord.status = 'Processed Successfully';
      uploadRecord.processedRecords = uploadRecord.recordsCount;
      this._salesUploadHistory$.next([...this._salesUploadHistory$.value]);
      this.saveToStorage('salesUploadHistory', this._salesUploadHistory$.value);
    }, 2000);
  }

  confirmSalesData(salesId: string): void {
    const salesData = this._salesData$.value.map((s) =>
      s.salesId === salesId
        ? {
            ...s,
            confirmedByTenant: true,
            confirmedDate: new Date().toISOString(),
            processingStatus: 'Confirmed by Tenant' as SalesDataStatus,
          }
        : s
    );
    this._salesData$.next(salesData);
    this.saveToStorage('salesData', salesData);
  }

  disputeSalesData(salesId: string, reason: string, claimedAmount: number): void {
    const salesRecord = this._salesData$.value.find((s) => s.salesId === salesId);
    if (!salesRecord) return;

    // Update sales data status
    const salesData = this._salesData$.value.map((s) =>
      s.salesId === salesId
        ? {
            ...s,
            processingStatus: 'Disputed by Tenant' as SalesDataStatus,
            disputedReason: reason,
          }
        : s
    );
    this._salesData$.next(salesData);
    this.saveToStorage('salesData', salesData);

    // Create dispute record
    const newDispute: SalesDispute = {
      disputeId: 'DISP-' + Date.now(),
      salesId: salesId,
      salesDate: salesRecord.salesDate,
      reportedAmount: salesRecord.totalSalesAmount,
      tenantClaimedAmount: claimedAmount,
      variance: salesRecord.totalSalesAmount - claimedAmount,
      reason: reason,
      submittedDate: new Date().toISOString(),
      status: 'Submitted',
    };

    const disputes = [newDispute, ...this._salesDisputes$.value];
    this._salesDisputes$.next(disputes);
    this.saveToStorage('salesDisputes', disputes);
  }

  getSalesUploadHistory(): SalesUploadHistory[] {
    return this._salesUploadHistory$.value;
  }

  getSalesDisputes(): SalesDispute[] {
    return this._salesDisputes$.value;
  }

  downloadSalesReport(reportType: string, filters: any): void {
    // Placeholder for download functionality
    console.log(`Downloading ${reportType} report with filters:`, filters);
    // In production, this would trigger a file download
  }

  private getMockSalesData(): SalesData[] {
    const shops = this.getMockShops();
    const salesData: SalesData[] = [];
    const today = new Date('2026-05-23');

    // Generate 18 sales records covering the last 30 days
    for (let i = 0; i < 18; i++) {
      const daysAgo = Math.floor(i * 1.7); // Spread across ~30 days
      const salesDate = new Date(today);
      salesDate.setDate(salesDate.getDate() - daysAgo);

      const shop = shops[i % shops.length];
      const baseAmount = Math.floor(Math.random() * 45000) + 5000; // 5k to 50k
      const transactionCount = Math.floor(Math.random() * 450) + 50; // 50 to 500

      // Status distribution
      let status: SalesDataStatus;
      const rand = Math.random();
      if (rand < 0.60) status = 'Processed Successfully';
      else if (rand < 0.80) status = 'Pending Tenant Confirmation';
      else if (rand < 0.95) status = 'Confirmed by Tenant';
      else if (rand < 0.98) status = 'Validation Failed';
      else status = 'Disputed by Tenant';

      // Data source distribution
      const dataSource: SalesDataSource = Math.random() < 0.7 ? 'API Integration' : 'File Upload';

      // Payment method breakdown with realistic percentages
      const cashPercent = Math.random() * 0.3 + 0.1; // 10-40%
      const cardPercent = Math.random() * 0.4 + 0.3; // 30-70%
      const walletPercent = Math.random() * 0.2; // 0-20%
      const otherPercent = 1 - cashPercent - cardPercent - walletPercent;

      const paymentBreakdown: PaymentMethodBreakdown = {
        cash: Math.round(baseAmount * cashPercent),
        card: Math.round(baseAmount * cardPercent),
        digitalWallet: Math.round(baseAmount * walletPercent),
        other: Math.round(baseAmount * otherPercent),
      };

      salesData.push({
        salesId: 'SALES-' + String(i + 1).padStart(4, '0'),
        tenantId: 'TNT-001',
        tenantName: 'Al Noor Trading & Retail LLC',
        shopCode: shop.shopCode,
        shopName: shop.stationName,
        stationCode: shop.stationCode,
        stationName: shop.stationName,
        salesDate: salesDate.toISOString().split('T')[0],
        salesPeriod: 'Daily',
        totalSalesAmount: baseAmount,
        transactionCount: transactionCount,
        paymentMethodBreakdown: paymentBreakdown,
        dataSource: dataSource,
        uploadedDate: salesDate.toISOString(),
        processedDate: status === 'Processed Successfully' || status === 'Confirmed by Tenant' ? salesDate.toISOString() : undefined,
        processingStatus: status,
        validationStatus: status === 'Validation Failed' ? 'Invalid' : 'Valid',
        validationErrors:
          status === 'Validation Failed'
            ? ['Transaction count mismatch', 'Payment method totals do not match sales amount']
            : undefined,
        fileName: dataSource === 'File Upload' ? `sales_${shop.shopCode}_${salesDate.toISOString().split('T')[0]}.xlsx` : undefined,
        confirmedByTenant: status === 'Confirmed by Tenant',
        confirmedDate: status === 'Confirmed by Tenant' ? salesDate.toISOString() : undefined,
        disputedReason: status === 'Disputed by Tenant' ? 'Sales amount differs from our POS records' : undefined,
      });
    }

    return salesData.sort((a, b) => b.salesDate.localeCompare(a.salesDate));
  }

  private getMockSalesSummary(): SalesDataSummary {
    const salesData = this.getMockSalesData();
    const today = new Date('2026-05-23');
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const thisMonthSales = salesData.filter((s) => {
      const saleDate = new Date(s.salesDate);
      return saleDate >= thisMonthStart && saleDate <= today;
    });

    const lastMonthSales = salesData.filter((s) => {
      const saleDate = new Date(s.salesDate);
      return saleDate >= lastMonthStart && saleDate <= lastMonthEnd;
    });

    const totalSalesThisMonth = thisMonthSales.reduce((sum, s) => sum + s.totalSalesAmount, 0);
    const totalSalesLastMonth = lastMonthSales.reduce((sum, s) => sum + s.totalSalesAmount, 0);
    const totalTransactionsThisMonth = thisMonthSales.reduce((sum, s) => sum + s.transactionCount, 0);
    const averageDailySales = thisMonthSales.length > 0 ? totalSalesThisMonth / thisMonthSales.length : 0;

    const pendingConfirmations = salesData.filter((s) => s.processingStatus === 'Pending Tenant Confirmation').length;
    const validationFailures = salesData.filter((s) => s.processingStatus === 'Validation Failed').length;

    const lastUpload = salesData.find((s) => s.dataSource === 'File Upload');

    return {
      totalSalesThisMonth: totalSalesThisMonth,
      totalSalesLastMonth: totalSalesLastMonth,
      totalTransactionsThisMonth: totalTransactionsThisMonth,
      averageDailySales: Math.round(averageDailySales),
      pendingConfirmations: pendingConfirmations,
      validationFailures: validationFailures,
      lastUploadDate: lastUpload?.uploadedDate || new Date().toISOString(),
      dataSubmissionMethod: 'API Integration',
    };
  }

  private getMockUploadHistory(): SalesUploadHistory[] {
    return [
      {
        uploadId: 'UPLOAD-001',
        fileName: 'sales_may_week1_2026.xlsx',
        uploadDate: '2026-05-07T14:30:00',
        fileSize: 45678,
        recordsCount: 35,
        status: 'Processed Successfully',
        processedRecords: 35,
        failedRecords: 0,
      },
      {
        uploadId: 'UPLOAD-002',
        fileName: 'sales_may_week2_2026.xlsx',
        uploadDate: '2026-05-14T10:15:00',
        fileSize: 52341,
        recordsCount: 42,
        status: 'Processed Successfully',
        processedRecords: 40,
        failedRecords: 2,
        errorLog: 'Row 15: Invalid date format. Row 28: Missing transaction count.',
      },
      {
        uploadId: 'UPLOAD-003',
        fileName: 'sales_april_consolidated_2026.xlsx',
        uploadDate: '2026-05-01T09:00:00',
        fileSize: 128456,
        recordsCount: 120,
        status: 'Processed Successfully',
        processedRecords: 118,
        failedRecords: 2,
        errorLog: 'Row 45: Payment breakdown total mismatch. Row 89: Duplicate entry.',
      },
      {
        uploadId: 'UPLOAD-004',
        fileName: 'sales_corrections_may_2026.xlsx',
        uploadDate: '2026-05-18T16:45:00',
        fileSize: 23456,
        recordsCount: 8,
        status: 'Validation Failed',
        processedRecords: 0,
        failedRecords: 8,
        errorLog: 'File format incorrect. Expected columns: Date, Shop Code, Sales Amount, Transaction Count.',
      },
      {
        uploadId: 'UPLOAD-005',
        fileName: 'sales_WS-001-A_may15-20.xlsx',
        uploadDate: '2026-05-20T11:20:00',
        fileSize: 18934,
        recordsCount: 6,
        status: 'Processed Successfully',
        processedRecords: 6,
        failedRecords: 0,
      },
    ];
  }

  private getMockSalesDisputes(): SalesDispute[] {
    return [
      {
        disputeId: 'DISP-001',
        salesId: 'SALES-0015',
        salesDate: '2026-05-10',
        reportedAmount: 28500,
        tenantClaimedAmount: 26800,
        variance: 1700,
        reason: 'Our POS system shows QAR 26,800. The reported amount includes transactions that were refunded.',
        submittedDate: '2026-05-12T09:30:00',
        status: 'Under Review',
      },
      {
        disputeId: 'DISP-002',
        salesId: 'SALES-0008',
        salesDate: '2026-04-28',
        reportedAmount: 45200,
        tenantClaimedAmount: 43500,
        variance: 1700,
        reason: 'Discrepancy in card payment settlement. Bank statement shows lower amount.',
        submittedDate: '2026-05-02T14:15:00',
        status: 'Resolved',
        resolution: 'Reconciliation completed. Amount adjusted to QAR 43,500. Invoice updated.',
        resolvedDate: '2026-05-08T10:00:00',
      },
      {
        disputeId: 'DISP-003',
        salesId: 'SALES-0003',
        salesDate: '2026-03-15',
        reportedAmount: 32100,
        tenantClaimedAmount: 31200,
        variance: 900,
        reason: 'System downtime on March 15 from 2-4 PM. Transactions during this period not captured.',
        submittedDate: '2026-03-18T11:00:00',
        status: 'Resolved',
        resolution: 'Technical issue confirmed. Amount adjusted based on tenant records.',
        resolvedDate: '2026-03-22T15:30:00',
      },
    ];
  }

  // ----- Utility -----
  private saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}.${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  private loadFromStorage(key: string): any {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}.${key}`);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Failed to load from localStorage', e);
      return null;
    }
  }
}
