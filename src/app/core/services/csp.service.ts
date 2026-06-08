import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Customer, SessionUser } from '../../models/customer.model';
import { ExistingDocument, StagedDocumentMap } from '../../models/document.model';
import {
  ApprovalTrailEntry,
  CspRequest,
  ProfileChangeDraft,
  RequestStatus,
  RequestSubmissionInput,
} from '../../models/request.model';
import {
  User,
  SettingsState,
  CompanyDocument,
  PasswordPolicy,
  LoginHistoryEntry,
  AuditLogEntry,
  LOB,
  LOBContact,
  ApprovalFlowConfig,
  LOBAPIConfig,
  ConfigurationFlow,
} from '../../models/settings.model';
import { Voucher, WoqodStation, FleetVehicle } from '../../models/voucher.model';
import {
  CustomerAPICredential,
  Invoice,
  Vehicle,
  ConsumptionTransaction,
  ConsumptionSummary,
  APIRequestLog,
  RateLimitEntry,
} from '../../models/open-api.model';
import {
  HomeBanner,
  News,
  Tender,
  WoqodService,
  CustomerServiceInterest,
  HomeSection,
  ServiceCode,
  ServiceEligibilityResponse,
  ServiceInterestResponse,
} from '../../models/home.model';

const STORAGE_PREFIX = 'csp';

@Injectable({ providedIn: 'root' })
export class CspService {
  private readonly _profileChanges$ = new BehaviorSubject<ProfileChangeDraft | null>(null);
  private readonly _uploadedDocuments$ = new BehaviorSubject<StagedDocumentMap>({});
  private readonly _submittedRequests$ = new BehaviorSubject<CspRequest[]>([]);
  private readonly _currentUser$ = new BehaviorSubject<SessionUser | null>(null);
  private readonly _customer$ = new BehaviorSubject<Customer | null>(null);
  private readonly _users$ = new BehaviorSubject<User[]>([]);
  private readonly _settingsState$ = new BehaviorSubject<SettingsState | null>(null);
  private readonly _configurations$ = new BehaviorSubject<ConfigurationFlow[]>([]);
  private readonly _vouchers$ = new BehaviorSubject<Voucher[]>([]);
  private readonly _fleetVehicles$ = new BehaviorSubject<FleetVehicle[]>([]);

  // Open API data
  private readonly _apiCredential$ = new BehaviorSubject<CustomerAPICredential | null>(null);
  private readonly _apiRequestLogs$ = new BehaviorSubject<APIRequestLog[]>([]);
  private readonly _rateLimitEntries$ = new BehaviorSubject<RateLimitEntry[]>([]);

  // Home page data
  private readonly _serviceInterests$ = new BehaviorSubject<CustomerServiceInterest[]>([]);

  readonly profileChanges$: Observable<ProfileChangeDraft | null> = this._profileChanges$.asObservable();
  readonly uploadedDocuments$: Observable<StagedDocumentMap> = this._uploadedDocuments$.asObservable();
  readonly submittedRequests$: Observable<CspRequest[]> = this._submittedRequests$.asObservable();
  readonly currentUser$: Observable<SessionUser | null> = this._currentUser$.asObservable();
  readonly customer$: Observable<Customer | null> = this._customer$.asObservable();
  readonly users$: Observable<User[]> = this._users$.asObservable();
  readonly settingsState$: Observable<SettingsState | null> = this._settingsState$.asObservable();
  readonly configurations$: Observable<ConfigurationFlow[]> = this._configurations$.asObservable();
  readonly vouchers$: Observable<Voucher[]> = this._vouchers$.asObservable();
  readonly fleetVehicles$: Observable<FleetVehicle[]> = this._fleetVehicles$.asObservable();

  // Open API observables
  readonly apiCredential$: Observable<CustomerAPICredential | null> = this._apiCredential$.asObservable();
  readonly apiRequestLogs$: Observable<APIRequestLog[]> = this._apiRequestLogs$.asObservable();

  // Home page observables
  readonly serviceInterests$: Observable<CustomerServiceInterest[]> = this._serviceInterests$.asObservable();

  constructor() {
    this.initializeMockSession();
    this.loadFromStorage();
  }

  // ----- profile changes (Edit Profile draft) -----
  saveProfileChanges(draft: ProfileChangeDraft): void {
    this._profileChanges$.next(draft);
    this.saveToStorage('profileChanges', draft);
  }

  getProfileChanges(): ProfileChangeDraft | null {
    return this._profileChanges$.value;
  }

  clearProfileChanges(): void {
    this._profileChanges$.next(null);
    localStorage.removeItem(`${STORAGE_PREFIX}.profileChanges`);
  }

  // ----- uploaded documents (Documents staging) -----
  saveUploadedDocuments(docs: StagedDocumentMap): void {
    this._uploadedDocuments$.next({ ...docs });
    this.saveToStorage('uploadedDocuments', docs);
  }

  getUploadedDocuments(): StagedDocumentMap {
    return this._uploadedDocuments$.value;
  }

  clearUploadedDocuments(): void {
    this._uploadedDocuments$.next({});
    localStorage.removeItem(`${STORAGE_PREFIX}.uploadedDocuments`);
  }

  // ----- submitted requests (Track Requests / Maker / Checker) -----
  submitRequest(input: RequestSubmissionInput): string {
    const user = this._currentUser$.value;
    const requestId = 'REQ-' + Date.now();
    const requestType =
      (input.profileChanges?.changedFields?.length ?? 0) > 0 &&
      Object.keys(input.documents || {}).length > 0
        ? 'Profile + Documents Update'
        : (input.profileChanges?.changedFields?.length ?? 0) > 0
        ? 'Profile Update'
        : 'Document Update';
    const now = new Date().toISOString();
    const req: CspRequest = {
      requestId,
      customerId: user?.customerId ?? 'CUST-001',
      customerName: user?.customerName ?? 'Hadad Medical Corporation',
      submittedBy: user?.fullName ?? 'Sagar Marthin',
      submittedAt: now,
      requestType,
      status: 'Submitted',
      stage: 'Maker Review',
      reason: input.reason,
      comments: input.comments ?? null,
      profileChanges: input.profileChanges,
      documents: input.documents,
      approvalTrail: [
        {
          stage: 'Submitted',
          action: 'Submitted for approval',
          timestamp: now,
          user: user?.fullName ?? 'Sagar Marthin',
          remarks: input.comments ?? null,
        },
      ],
    };
    const next = [req, ...this._submittedRequests$.value];
    this._submittedRequests$.next(next);
    this.saveToStorage('submittedRequests', next);
    return requestId;
  }

  getSubmittedRequests(): CspRequest[] {
    return this._submittedRequests$.value;
  }

  updateRequestStatus(
    requestId: string,
    status: RequestStatus,
    stage: string,
    action: string,
    remarks?: string,
    actor?: string,
  ): void {
    const user = this._currentUser$.value;
    const list = [...this._submittedRequests$.value];
    const idx = list.findIndex((r) => r.requestId === requestId);
    if (idx < 0) return;
    const req = { ...list[idx] };
    req.status = status;
    req.stage = stage;
    const trailEntry: ApprovalTrailEntry = {
      stage,
      action,
      timestamp: new Date().toISOString(),
      user: actor || user?.fullName || 'System',
      remarks: remarks ?? null,
    };
    req.approvalTrail = [...(req.approvalTrail ?? []), trailEntry];
    list[idx] = req;
    this._submittedRequests$.next(list);
    this.saveToStorage('submittedRequests', list);
  }

  submitGeneralRequest(type: string, subject: string, description: string, priority: string): string {
    const user = this._currentUser$.value;
    const customer = this.getCustomer();
    const requestId = 'REQ-' + Date.now();
    const now = new Date().toISOString();

    const req: CspRequest = {
      requestId,
      customerId: customer.customerId,
      customerName: customer.customerName,
      submittedBy: user?.fullName ?? 'Customer User',
      submittedAt: now,
      requestType: type,
      status: 'Submitted',
      stage: 'Submitted',
      reason: subject,
      comments: description,
      profileChanges: null,
      documents: {},
      approvalTrail: [
        {
          stage: 'Submitted',
          action: 'Request Submitted',
          timestamp: now,
          user: user?.fullName ?? 'Customer User',
          remarks: `Priority: ${priority}`,
        },
      ],
    };

    const next = [req, ...this._submittedRequests$.value];
    this._submittedRequests$.next(next);
    this.saveToStorage('submittedRequests', next);
    return requestId;
  }

  clearDrafts(): void {
    this.clearProfileChanges();
    this.clearUploadedDocuments();
  }

  // ----- mock customer + reference data (used by profile/edit-profile pages) -----
  getCustomer(): Customer {
    return (
      this._customer$.value ?? {
        customerId: 'CUST-001',
        customerCode: '00001234',
        customerName: 'Hadad Medical Corporation',
        partyNumber: 'PAR-001',
        customerType: 'Corporate',
        status: 'Active',
        createdDate: '2023-01-15',
        registryId: 'CR-2023-1234567',
        businessClassification: 'Healthcare — Medical Distribution',
        businessSubClassification: 'Medical Equipment & Supplies',
        accountType: 'External',
        accountDescription: 'Leading medical equipment supplier in Qatar.',
        primaryContact: {
          prefix: 'Mr.',
          firstName: 'Ahmed',
          middleName: 'Mohammad',
          lastName: 'Al-Mohannadi',
          jobTitle: 'General Manager',
          email: 'ahmed.almohannadi@hadad-medical.com',
          phone: '+974-4413-9999',
          phoneExtension: '101',
        },
        registeredAddress: {
          country: 'Qatar',
          address1: 'Building 123, Industrial Area',
          address2: 'Street 45',
          city: 'Doha',
          state: 'Doha',
          postalCode: '12345',
        },
        billingAddress: {
          country: 'Qatar',
          address1: 'Building 123, Industrial Area',
          address2: 'Street 45',
          city: 'Doha',
          state: 'Doha',
          postalCode: '12345',
        },
        servicesEnabled: ['RETAIL', 'BULK_FUEL', 'AVIATION', 'BUNKERING', 'BITUMEN', 'FAHES', 'BULK_GAS', 'SHAFAF', 'KENAR'], // Service codes the customer is eligible for
        paymentTerms: 'Net 30',
        paymentMethod: 'Bank Transfer',
        accountModel: 'Postpaid (Credit)',
        creditLimit: 500000,
        currency: 'QAR',
        lastApprovedDate: '2024-04-15',
      }
    );
  }

  getExistingDocuments(): ExistingDocument[] {
    return [
      { docType: 'CR_COPY', fileName: 'CR_Copy_v2.pdf', uploadedDate: '2024-04-15', fileSize: 2400000, version: 2, status: 'Approved', expiryDate: null },
      { docType: 'BANK_GUARANTEE', fileName: 'Bank_Guarantee_v1.pdf', uploadedDate: '2024-01-15', fileSize: 1800000, version: 1, status: 'Approved', expiryDate: '2025-01-15' },
      { docType: 'VAT_CERT', fileName: 'VAT_Certificate_v1.pdf', uploadedDate: '2024-04-20', fileSize: 950000, version: 1, status: 'Pending Review', expiryDate: null },
    ];
  }

  getMockRequests(): CspRequest[] {
    return [
      {
        requestId: 'REQ-2024-04-0042', customerId: 'CUST-001', customerName: 'Hadad Medical Corporation',
        submittedBy: 'Sagar Marthin', submittedAt: '2024-04-20T10:00:00Z',
        requestType: 'Profile Update', status: 'Maker Review', stage: 'Maker Review',
        reason: 'contact_update', comments: 'Please review ASAP — new email is now active.',
        profileChanges: {
          submittedAt: '2024-04-20T10:00:00Z',
          changedFields: ['email', 'phone'],
          oldValues: { email: 'ahmed.almohannadi@hadad-medical.com', phone: '+974-4413-9999' },
          newValues: { email: 'ahmed.k@hadad-medical.com', phone: '+974-4413-1111' },
        },
        documents: {},
        approvalTrail: [
          { stage: 'Submitted', timestamp: '2024-04-20T10:00:00Z', user: 'Sagar Marthin', action: 'Submitted for approval', remarks: 'Please review ASAP — new email is now active.' },
          { stage: 'Maker Review', timestamp: '2024-04-20T11:30:00Z', user: 'System', action: 'Assigned to Maker queue', remarks: null },
        ],
      },
      {
        requestId: 'REQ-2024-04-0035', customerId: 'CUST-001', customerName: 'Hadad Medical Corporation',
        submittedBy: 'Sagar Marthin', submittedAt: '2024-04-15T14:00:00Z',
        requestType: 'Document Renewal', status: 'Approved', stage: 'Completed',
        reason: 'document_refresh', comments: null,
        profileChanges: null,
        documents: { CR_COPY: { fileName: 'CR_Copy_v3.pdf', fileSize: 2400000, uploadedAt: '2024-04-15T13:55:00Z', status: 'Staged' } },
        approvalTrail: [
          { stage: 'Submitted', timestamp: '2024-04-15T14:00:00Z', user: 'Sagar Marthin', action: 'Submitted for approval', remarks: null },
          { stage: 'Maker Review', timestamp: '2024-04-16T09:00:00Z', user: 'Ahmed Al-Mohannadi', action: 'Approved and forwarded to Checker', remarks: 'Documents look good.' },
          { stage: 'Checker Approval', timestamp: '2024-04-18T11:00:00Z', user: 'Fatima Al-Sulaiti', action: 'Approved', remarks: 'All clear. Updating ERP.' },
        ],
      },
      {
        requestId: 'REQ-2024-04-0021', customerId: 'CUST-001', customerName: 'Hadad Medical Corporation',
        submittedBy: 'Sagar Marthin', submittedAt: '2024-04-10T08:00:00Z',
        requestType: 'Address Change', status: 'Rejected', stage: 'Completed',
        reason: 'address_change', comments: null,
        profileChanges: {
          submittedAt: '2024-04-10T08:00:00Z',
          changedFields: ['address1', 'city'],
          oldValues: { address1: 'Building 123, Industrial Area', city: 'Doha' },
          newValues: { address1: 'Building 47, West Bay', city: 'Doha' },
        },
        documents: {},
        approvalTrail: [
          { stage: 'Submitted', timestamp: '2024-04-10T08:00:00Z', user: 'Sagar Marthin', action: 'Submitted for approval', remarks: null },
          { stage: 'Maker Review', timestamp: '2024-04-12T10:00:00Z', user: 'Ahmed Al-Mohannadi', action: 'Rejected — missing documentation', remarks: 'Please upload utility bill or lease agreement as address proof.' },
        ],
      },
    ];
  }

  getCombinedRequests(): CspRequest[] {
    const saved = this._submittedRequests$.value;
    const seen = new Set<string>();
    return [...saved, ...this.getMockRequests()].filter((r) =>
      seen.has(r.requestId) ? false : (seen.add(r.requestId), true),
    );
  }

  // ----- settings: users & access management -----
  getUsers(): User[] {
    return this._users$.value;
  }

  saveUser(user: User): void {
    const list = [...this._users$.value];
    const idx = list.findIndex((u) => u.userId === user.userId);
    if (idx >= 0) {
      list[idx] = { ...user, lastModified: new Date().toISOString() };
    } else {
      list.push(user);
    }
    this._users$.next(list);
    this.saveToStorage('users', list);
  }

  deleteUser(userId: string): void {
    const list = this._users$.value.filter((u) => u.userId !== userId);
    this._users$.next(list);
    this.saveToStorage('users', list);
  }

  getMockUsers(): User[] {
    return [
      {
        userId: 'USR-001',
        fullName: 'Sagar Marthin',
        email: 'sagar.marthin@hadad-medical.com',
        phone: '+974-4413-2001',
        role: 'Super Admin',
        lobAssignments: [
          { lob: 'Fuel', hasAccess: true },
          { lob: 'APC', hasAccess: true },
          { lob: 'Bulk Fuel', hasAccess: true },
        ],
        status: 'Active',
        lastLogin: '2024-05-22T08:30:00Z',
        createdDate: '2023-01-15',
      },
      {
        userId: 'USR-002',
        fullName: 'Ahmed Al-Mohannadi',
        email: 'ahmed.almohannadi@hadad-medical.com',
        phone: '+974-4413-2002',
        role: 'Maker',
        lobAssignments: [
          { lob: 'Fuel', hasAccess: true },
          { lob: 'APC', hasAccess: false },
          { lob: 'Bulk Fuel', hasAccess: true },
        ],
        status: 'Active',
        lastLogin: '2024-05-21T14:20:00Z',
        createdDate: '2023-02-10',
      },
      {
        userId: 'USR-003',
        fullName: 'Fatima Al-Sulaiti',
        email: 'fatima.sulaiti@hadad-medical.com',
        phone: '+974-4413-2003',
        role: 'Checker',
        lobAssignments: [
          { lob: 'Fuel', hasAccess: true },
          { lob: 'APC', hasAccess: true },
          { lob: 'Bulk Fuel', hasAccess: false },
        ],
        status: 'Active',
        lastLogin: '2024-05-22T09:15:00Z',
        createdDate: '2023-03-20',
      },
      {
        userId: 'USR-004',
        fullName: 'Mohammed Hassan',
        email: 'mohammed.hassan@hadad-medical.com',
        phone: '+974-4413-2004',
        role: 'Editor',
        lobAssignments: [
          { lob: 'Fuel', hasAccess: true },
          { lob: 'APC', hasAccess: false },
          { lob: 'Bulk Fuel', hasAccess: false },
        ],
        status: 'Active',
        lastLogin: '2024-05-20T16:45:00Z',
        createdDate: '2023-06-01',
      },
      {
        userId: 'USR-005',
        fullName: 'Layla Ibrahim',
        email: 'layla.ibrahim@hadad-medical.com',
        phone: '+974-4413-2005',
        role: 'Viewer',
        lobAssignments: [
          { lob: 'Fuel', hasAccess: false },
          { lob: 'APC', hasAccess: true },
          { lob: 'Bulk Fuel', hasAccess: false },
        ],
        status: 'Inactive',
        lastLogin: '2024-04-10T11:00:00Z',
        createdDate: '2023-08-15',
      },
      {
        userId: 'USR-006',
        fullName: 'Khalid Al-Kuwari',
        email: 'khalid.kuwari@hadad-medical.com',
        phone: '+974-4413-2006',
        role: 'Viewer',
        lobAssignments: [
          { lob: 'Fuel', hasAccess: true },
          { lob: 'APC', hasAccess: false },
          { lob: 'Bulk Fuel', hasAccess: false },
        ],
        status: 'Active',
        lastLogin: '2024-05-22T07:45:00Z',
        createdDate: '2023-09-10',
      },
      {
        userId: 'USR-007',
        fullName: 'Noor Al-Mansoori',
        email: 'noor.mansoori@hadad-medical.com',
        phone: '+974-4413-2007',
        role: 'Viewer',
        lobAssignments: [
          { lob: 'Fuel', hasAccess: false },
          { lob: 'APC', hasAccess: true },
          { lob: 'Bulk Fuel', hasAccess: true },
        ],
        status: 'Active',
        lastLogin: '2024-05-21T10:30:00Z',
        createdDate: '2023-10-05',
      },
      {
        userId: 'USR-008',
        fullName: 'Tariq Abdullah',
        email: 'tariq.abdullah@hadad-medical.com',
        phone: '+974-4413-2008',
        role: 'Editor',
        lobAssignments: [
          { lob: 'Fuel', hasAccess: false },
          { lob: 'APC', hasAccess: true },
          { lob: 'Bulk Fuel', hasAccess: true },
        ],
        status: 'Active',
        lastLogin: '2024-05-22T11:00:00Z',
        createdDate: '2023-11-12',
      },
      {
        userId: 'USR-009',
        fullName: 'Mariam Al-Thani',
        email: 'mariam.thani@hadad-medical.com',
        phone: '+974-4413-2009',
        role: 'Editor',
        lobAssignments: [
          { lob: 'Fuel', hasAccess: true },
          { lob: 'APC', hasAccess: true },
          { lob: 'Bulk Fuel', hasAccess: false },
        ],
        status: 'Active',
        lastLogin: '2024-05-21T15:20:00Z',
        createdDate: '2024-01-08',
      },
      {
        userId: 'USR-010',
        fullName: 'Youssef Al-Naimi',
        email: 'youssef.naimi@hadad-medical.com',
        phone: '+974-4413-2010',
        role: 'Maker',
        lobAssignments: [
          { lob: 'Fuel', hasAccess: false },
          { lob: 'APC', hasAccess: true },
          { lob: 'Bulk Fuel', hasAccess: true },
        ],
        status: 'Active',
        lastLogin: '2024-05-22T08:15:00Z',
        createdDate: '2024-02-14',
      },
      {
        userId: 'USR-011',
        fullName: 'Amina Al-Hajri',
        email: 'amina.hajri@hadad-medical.com',
        phone: '+974-4413-2011',
        role: 'Checker',
        lobAssignments: [
          { lob: 'Fuel', hasAccess: true },
          { lob: 'APC', hasAccess: false },
          { lob: 'Bulk Fuel', hasAccess: true },
        ],
        status: 'Active',
        lastLogin: '2024-05-22T09:45:00Z',
        createdDate: '2024-03-01',
      },
      {
        userId: 'USR-012',
        fullName: 'Hamad Al-Attiyah',
        email: 'hamad.attiyah@hadad-medical.com',
        phone: '+974-4413-2012',
        role: 'Viewer',
        lobAssignments: [
          { lob: 'Fuel', hasAccess: true },
          { lob: 'APC', hasAccess: true },
          { lob: 'Bulk Fuel', hasAccess: true },
        ],
        status: 'Inactive',
        lastLogin: '2024-03-20T14:00:00Z',
        createdDate: '2023-07-22',
      },
    ];
  }

  // ----- settings: company documents -----
  getCompanyDocuments(): CompanyDocument[] {
    // Check if documents are in localStorage first
    const stored = this.getFromStorage<CompanyDocument[]>('companyDocuments');
    if (stored) {
      return stored;
    }

    // Return default mock documents
    return [
      {
        docId: 'DOC-001',
        title: 'Commercial Registration',
        fileName: 'CR_Copy_2024.pdf',
        fileSize: 2400000,
        uploadedDate: '2024-04-15',
        category: 'Legal',
        description: 'Official commercial registration document',
        expiryDate: '2027-04-15',
        status: 'Active',
      },
      {
        docId: 'DOC-002',
        title: 'Trade License',
        fileName: 'Trade_License_2024.pdf',
        fileSize: 1800000,
        uploadedDate: '2024-01-10',
        category: 'Legal',
        description: 'Current trade license',
        expiryDate: '2026-06-15',
        status: 'Expiring Soon',
      },
      {
        docId: 'DOC-003',
        title: 'VAT Certificate',
        fileName: 'VAT_Certificate_2024.pdf',
        fileSize: 950000,
        uploadedDate: '2024-04-20',
        category: 'Tax',
        description: 'Valid VAT registration certificate',
        expiryDate: '2026-05-20',
        status: 'Expiring Soon',
      },
      {
        docId: 'DOC-004',
        title: 'Bank Guarantee',
        fileName: 'Bank_Guarantee_v1.pdf',
        fileSize: 1600000,
        uploadedDate: '2024-01-15',
        category: 'Financial',
        description: 'Bank guarantee letter for credit facility',
        expiryDate: '2025-01-15',
        status: 'Expired',
      },
      {
        docId: 'DOC-005',
        title: 'Company Profile',
        fileName: 'Company_Profile_2024.pdf',
        fileSize: 3200000,
        uploadedDate: '2023-12-01',
        category: 'Corporate',
        description: 'Official company profile and overview',
        status: 'Active',
      },
      {
        docId: 'DOC-006',
        title: 'Insurance Certificate',
        fileName: 'Insurance_2024.pdf',
        fileSize: 1200000,
        uploadedDate: '2024-03-01',
        category: 'Insurance',
        description: 'Company insurance policy certificate',
        expiryDate: '2027-03-01',
        status: 'Active',
      },
    ];
  }

  saveCompanyDocuments(documents: CompanyDocument[]): void {
    this.saveToStorage('companyDocuments', documents);
  }

  // ----- settings: security & compliance -----
  getPasswordPolicy(): PasswordPolicy {
    return {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90,
      historyCount: 5,
    };
  }

  getLoginHistory(): LoginHistoryEntry[] {
    return [
      {
        timestamp: '2024-05-22T08:30:00Z',
        user: 'Sagar Marthin',
        ipAddress: '172.16.254.1',
        device: 'Windows 11 - Chrome',
        status: 'Success',
        location: 'Doha, Qatar',
      },
      {
        timestamp: '2024-05-21T14:20:00Z',
        user: 'Ahmed Al-Mohannadi',
        ipAddress: '172.16.254.12',
        device: 'macOS - Safari',
        status: 'Success',
        location: 'Doha, Qatar',
      },
      {
        timestamp: '2024-05-21T09:15:00Z',
        user: 'Sagar Marthin',
        ipAddress: '172.16.254.1',
        device: 'Windows 11 - Chrome',
        status: 'Success',
        location: 'Doha, Qatar',
      },
      {
        timestamp: '2024-05-20T16:45:00Z',
        user: 'Mohammed Hassan',
        ipAddress: '172.16.254.23',
        device: 'Windows 10 - Edge',
        status: 'Success',
        location: 'Doha, Qatar',
      },
      {
        timestamp: '2024-05-20T11:30:00Z',
        user: 'Fatima Al-Sulaiti',
        ipAddress: '172.16.254.8',
        device: 'iPad - Safari',
        status: 'Success',
        location: 'Doha, Qatar',
      },
      {
        timestamp: '2024-05-19T22:15:00Z',
        user: 'Unknown User',
        ipAddress: '185.234.56.78',
        device: 'Windows - Chrome',
        status: 'Failed',
        location: 'Unknown',
      },
      {
        timestamp: '2024-05-19T10:00:00Z',
        user: 'Sagar Marthin',
        ipAddress: '172.16.254.1',
        device: 'Windows 11 - Chrome',
        status: 'Success',
        location: 'Doha, Qatar',
      },
    ];
  }

  getAuditLog(): AuditLogEntry[] {
    return [
      {
        timestamp: '2024-05-22T08:35:00Z',
        user: 'Sagar Marthin',
        action: 'Viewed profile',
        module: 'Profile',
        details: 'Accessed company profile page',
        ipAddress: '172.16.254.1',
      },
      {
        timestamp: '2024-05-21T15:20:00Z',
        user: 'Ahmed Al-Mohannadi',
        action: 'Approved request',
        module: 'Maker Review',
        details: 'Approved request REQ-2024-04-0042',
        ipAddress: '172.16.254.12',
      },
      {
        timestamp: '2024-05-21T14:30:00Z',
        user: 'Sagar Marthin',
        action: 'Submitted request',
        module: 'Review Changes',
        details: 'Submitted profile change request',
        ipAddress: '172.16.254.1',
      },
      {
        timestamp: '2024-05-20T16:50:00Z',
        user: 'Mohammed Hassan',
        action: 'Updated profile',
        module: 'Edit Profile',
        details: 'Modified primary contact email',
        ipAddress: '172.16.254.23',
      },
      {
        timestamp: '2024-05-20T11:35:00Z',
        user: 'Fatima Al-Sulaiti',
        action: 'Approved request',
        module: 'Checker Approval',
        details: 'Final approval for REQ-2024-04-0035',
        ipAddress: '172.16.254.8',
      },
      {
        timestamp: '2024-05-19T22:15:00Z',
        user: 'Unknown',
        action: 'Failed login attempt',
        module: 'Authentication',
        details: 'Invalid credentials',
        ipAddress: '185.234.56.78',
      },
      {
        timestamp: '2024-05-19T10:05:00Z',
        user: 'Sagar Marthin',
        action: 'Uploaded document',
        module: 'Documents',
        details: 'Uploaded VAT_Certificate_2024.pdf',
        ipAddress: '172.16.254.1',
      },
      {
        timestamp: '2024-05-18T14:20:00Z',
        user: 'Ahmed Al-Mohannadi',
        action: 'Rejected request',
        module: 'Maker Review',
        details: 'Rejected REQ-2024-04-0021 - missing documentation',
        ipAddress: '172.16.254.12',
      },
    ];
  }

  exportAuditLog(): Blob {
    const logs = this.getAuditLog();
    const header = 'Timestamp,User,Action,Module,Details,IP Address\n';
    const rows = logs.map((log) =>
      [
        log.timestamp,
        `"${log.user}"`,
        `"${log.action}"`,
        `"${log.module}"`,
        `"${log.details}"`,
        log.ipAddress,
      ].join(',')
    );
    const csv = header + rows.join('\n');
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  // ----- settings: settings state (notifications, system preferences) -----
  getSettingsState(): SettingsState | null {
    return this._settingsState$.value;
  }

  updateSettings(settings: SettingsState): void {
    this._settingsState$.next(settings);
    this.saveToStorage('settingsState', settings);
  }

  getDefaultSettings(): SettingsState {
    return {
      notificationPreferences: {
        channels: {
          email: true,
          sms: false,
          push: true,
        },
        alertTypes: {
          fuel_prices: true,
          station_downtime: true,
          system_downtime: true,
          announcements: true,
          monthly_invoices: true,
          payment_due: true,
          request_status: true,
          promotions: false,
          account_activity: true,
        },
      },
      systemPreferences: {
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
        defaultDashboardView: 'all',
      },
      lobContacts: this.getLOBContacts(),
      approvalFlows: this.getApprovalFlows(),
      apiConfigs: this.getAPIConfigs(),
    };
  }

  // ----- settings: LOB contacts -----
  getLOBContacts(): LOBContact[] {
    return [
      {
        lob: 'Fuel',
        department: 'Fuel Operations',
        users: [
          {
            userId: 'U001',
            name: 'Ahmed Al-Mohannadi',
            email: 'ahmed.mohannadi@hadad-medical.com',
            phone: '+974-4413-1001',
            role: 'Maker',
          },
          {
            userId: 'U002',
            name: 'Sara Al-Khater',
            email: 'sara.khater@hadad-medical.com',
            phone: '+974-4413-1005',
            role: 'Viewer',
          },
        ],
      },
      {
        lob: 'APC',
        department: 'Aviation Services',
        users: [
          {
            userId: 'U003',
            name: 'Fatima Al-Sulaiti',
            email: 'fatima.sulaiti@hadad-medical.com',
            phone: '+974-4413-1002',
            role: 'Checker',
          },
        ],
      },
      {
        lob: 'Bulk Fuel',
        department: 'Industrial Fuel',
        users: [
          {
            userId: 'U004',
            name: 'Mohammed Hassan',
            email: 'mohammed.hassan@hadad-medical.com',
            phone: '+974-4413-1003',
            role: 'Editor',
          },
        ],
      },
    ];
  }

  saveLOBContact(contact: LOBContact): void {
    const settings = this.getSettingsState();
    if (settings) {
      if (!settings.lobContacts) settings.lobContacts = [];
      const index = settings.lobContacts.findIndex(c => c.lob === contact.lob);
      if (index >= 0) {
        settings.lobContacts[index] = contact;
      } else {
        settings.lobContacts.push(contact);
      }
      this.updateSettings(settings);
    }
  }

  // ----- settings: approval flows -----
  getApprovalFlows(): ApprovalFlowConfig[] {
    return [
      {
        flowId: 'FLOW-001',
        lob: 'Fuel',
        flowType: 'invoice',
        enabled: true,
        autoSyncToERP: true,
        requireAllApprovals: true,
        description: 'Invoice approval workflow for fuel transactions',
        steps: [
          { stepId: 'STEP-001', level: 1, approverRole: 'Editor', isRequired: true },
          { stepId: 'STEP-002', level: 2, approverRole: 'Maker', minAmount: 10000, isRequired: true },
          { stepId: 'STEP-003', level: 3, approverRole: 'Checker', minAmount: 50000, isRequired: false },
        ],
      },
      {
        flowId: 'FLOW-002',
        lob: 'Fuel',
        flowType: 'purchase_order',
        enabled: false,
        autoSyncToERP: false,
        requireAllApprovals: false,
        description: 'Purchase order approval for fuel supplies',
        steps: [
          { stepId: 'STEP-004', level: 1, approverRole: 'Maker', isRequired: true },
        ],
      },
      {
        flowId: 'FLOW-003',
        lob: 'APC',
        flowType: 'invoice',
        enabled: true,
        autoSyncToERP: true,
        requireAllApprovals: true,
        description: 'Aviation fuel invoice approval workflow',
        steps: [
          { stepId: 'STEP-005', level: 1, approverRole: 'Editor', isRequired: true },
          { stepId: 'STEP-006', level: 2, approverRole: 'Checker', isRequired: true },
        ],
      },
      {
        flowId: 'FLOW-004',
        lob: 'Bulk Fuel',
        flowType: 'invoice',
        enabled: true,
        autoSyncToERP: false,
        requireAllApprovals: true,
        description: 'Bulk fuel delivery invoice approval',
        steps: [
          { stepId: 'STEP-007', level: 1, approverRole: 'Maker', maxAmount: 100000, isRequired: true },
          { stepId: 'STEP-008', level: 2, approverRole: 'Checker', minAmount: 100000, isRequired: true },
        ],
      },
    ];
  }

  saveApprovalFlow(flow: ApprovalFlowConfig): void {
    const settings = this.getSettingsState();
    if (settings) {
      const index = settings.approvalFlows.findIndex(f => f.flowId === flow.flowId);
      if (index >= 0) {
        settings.approvalFlows[index] = flow;
      } else {
        settings.approvalFlows.push(flow);
      }
      this.updateSettings(settings);
    }
  }

  // ----- settings: configurations (customer-defined dynamic approval flows) -----
  getConfigurations(): ConfigurationFlow[] {
    return this._configurations$.value;
  }

  saveConfiguration(config: ConfigurationFlow): void {
    const list = [...this._configurations$.value];
    const idx = list.findIndex((c) => c.configId === config.configId);
    if (idx >= 0) {
      list[idx] = { ...config, lastModified: new Date().toISOString() };
    } else {
      list.push(config);
    }
    this._configurations$.next(list);
    this.saveToStorage('configurations', list);
  }

  deleteConfiguration(configId: string): void {
    const list = this._configurations$.value.filter((c) => c.configId !== configId);
    this._configurations$.next(list);
    this.saveToStorage('configurations', list);
  }

  getMockConfigurations(): ConfigurationFlow[] {
    return [
      {
        configId: 'CFG-001',
        name: 'Invoice Verification — Finance',
        approvalType: 'invoice_verification',
        description: 'This approval flow will be configured to verify the invoice within WOQOD portal and get the complete invoice information from WOQOD portal to internal ERP or Finance System.',
        enabled: true,
        approvers: [
          { levelId: 'LVL-001', level: 1, title: 'Accounts Officer', userId: 'USR-002', userName: 'Ahmed Al-Mohannadi', userEmail: 'ahmed.almohannadi@hadad-medical.com' },
          { levelId: 'LVL-002', level: 2, title: 'Finance Manager', userId: 'USR-003', userName: 'Fatima Al-Sulaiti', userEmail: 'fatima.sulaiti@hadad-medical.com' },
        ],
        pushToOpenApi: true,
        apiEndpointPath: '/api/v1/approvals/invoice-verification',
        createdDate: '2025-11-04T09:00:00.000Z',
      },
      {
        configId: 'CFG-002',
        name: 'Profile Change Approval',
        approvalType: 'profile_change',
        description: 'Profile edits require manager sign-off before the change request reaches WOQOD.',
        enabled: false,
        approvers: [
          { levelId: 'LVL-003', level: 1, title: 'Department Head', userId: 'USR-001', userName: 'Sagar Marthin', userEmail: 'sagar.marthin@hadad-medical.com' },
        ],
        pushToOpenApi: false,
        apiEndpointPath: '/api/v1/approvals/profile-change',
        createdDate: '2025-12-01T11:30:00.000Z',
      },
    ];
  }

  // ----- retail: voucher management -----
  getVouchers(): Voucher[] {
    return this._vouchers$.value;
  }

  saveVoucher(voucher: Voucher): void {
    const list = [...this._vouchers$.value];
    const idx = list.findIndex((v) => v.voucherId === voucher.voucherId);
    if (idx >= 0) {
      list[idx] = { ...voucher, lastModified: new Date().toISOString() };
    } else {
      list.push(voucher);
    }
    this._vouchers$.next(list);
    this.saveToStorage('vouchers', list);
  }

  deleteVoucher(voucherId: string): void {
    const list = this._vouchers$.value.filter((v) => v.voucherId !== voucherId);
    this._vouchers$.next(list);
    this.saveToStorage('vouchers', list);
  }

  /** Customer fleet vehicles, each with an assigned driver + mobile number. */
  getFleetVehicles(): FleetVehicle[] {
    return this._fleetVehicles$.value;
  }

  getMockFleetVehicles(): FleetVehicle[] {
    return [
      { vehicleId: 'VEH-001', plateNo: '123456', type: 'Pickup', driverName: 'Rakesh Kumar', driverPhone: '+974-5512-3001' },
      { vehicleId: 'VEH-002', plateNo: '234567', type: 'Sedan', driverName: 'Mahmoud Saleh', driverPhone: '+974-5512-3002' },
      { vehicleId: 'VEH-003', plateNo: '345678', type: 'Tanker', driverName: 'Imran Ali', driverPhone: '+974-5512-3003' },
      { vehicleId: 'VEH-004', plateNo: '456789', type: 'Van', driverName: 'Suresh Nair', driverPhone: '+974-5512-3004' },
      { vehicleId: 'VEH-005', plateNo: '567890', type: 'Pickup', driverName: 'Bilal Ahmed', driverPhone: '+974-5512-3005' },
    ];
  }

  /** WOQOD stations available for voucher restrictions / redemptions. */
  getWoqodStations(): WoqodStation[] {
    return [
      { code: 'STN-001', name: 'WOQOD Station — Doha Main' },
      { code: 'STN-002', name: 'WOQOD Station — Al Sadd' },
      { code: 'STN-003', name: 'WOQOD Station — Industrial Area' },
      { code: 'STN-004', name: 'WOQOD Station — Lusail' },
      { code: 'STN-005', name: 'WOQOD Station — Al Wakrah' },
      { code: 'STN-006', name: 'WOQOD Station — Al Khor' },
    ];
  }

  getMockVouchers(): Voucher[] {
    return [
      {
        voucherId: 'VCH-1001',
        code: 'WQ-VCH-8F3A',
        qrToken: 'tkn_8f3a21bc',
        vehicleId: 'VEH-001',
        vehiclePlate: '123456',
        driverName: 'Rakesh Kumar',
        driverPhone: '+974-5512-3001',
        amount: 5000,
        expiryDate: '2026-12-31',
        createdDate: '2026-05-02T08:00:00.000Z',
        baseStatus: 'Active',
        stationCodes: ['STN-001', 'STN-002'],
        allowedDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
        dailyLimit: 300,
        weeklyLimit: 1500,
        monthlyLimit: 4000,
        redemptions: [
          { date: '2026-05-05T07:30:00.000Z', amount: 280, stationCode: 'STN-001', stationName: 'WOQOD Station — Doha Main' },
          { date: '2026-05-12T06:50:00.000Z', amount: 300, stationCode: 'STN-002', stationName: 'WOQOD Station — Al Sadd' },
          { date: '2026-05-20T09:10:00.000Z', amount: 250, stationCode: 'STN-001', stationName: 'WOQOD Station — Doha Main' },
        ],
      },
      {
        voucherId: 'VCH-1002',
        code: 'WQ-VCH-2C9D',
        qrToken: 'tkn_2c9d77ef',
        vehicleId: 'VEH-002',
        vehiclePlate: '234567',
        driverName: 'Mahmoud Saleh',
        driverPhone: '+974-5512-3002',
        amount: 2000,
        expiryDate: '2026-09-30',
        createdDate: '2026-04-15T10:00:00.000Z',
        baseStatus: 'Active',
        stationCodes: [],
        allowedDays: [],
        dailyLimit: 200,
        weeklyLimit: null,
        monthlyLimit: null,
        redemptions: [
          { date: '2026-04-18T11:00:00.000Z', amount: 2000, stationCode: 'STN-004', stationName: 'WOQOD Station — Lusail' },
        ],
      },
      {
        voucherId: 'VCH-1003',
        code: 'WQ-VCH-5B1E',
        qrToken: 'tkn_5b1e90aa',
        vehicleId: 'VEH-003',
        vehiclePlate: '345678',
        driverName: 'Imran Ali',
        driverPhone: '+974-5512-3003',
        amount: 1500,
        expiryDate: '2026-05-01',
        createdDate: '2026-03-10T09:00:00.000Z',
        baseStatus: 'Active',
        stationCodes: ['STN-003'],
        allowedDays: [],
        dailyLimit: null,
        weeklyLimit: null,
        monthlyLimit: null,
        redemptions: [
          { date: '2026-03-20T08:00:00.000Z', amount: 400, stationCode: 'STN-003', stationName: 'WOQOD Station — Industrial Area' },
        ],
      },
      {
        voucherId: 'VCH-1004',
        code: 'WQ-VCH-7A0C',
        qrToken: 'tkn_7a0c33dd',
        vehicleId: 'VEH-004',
        vehiclePlate: '456789',
        driverName: 'Suresh Nair',
        driverPhone: '+974-5512-3004',
        amount: 3000,
        expiryDate: '2026-11-15',
        createdDate: '2026-05-25T07:00:00.000Z',
        baseStatus: 'Active',
        stationCodes: ['STN-001', 'STN-005', 'STN-006'],
        allowedDays: ['Fri', 'Sat'],
        dailyLimit: 500,
        weeklyLimit: 1000,
        monthlyLimit: 3000,
        redemptions: [],
      },
    ];
  }

  // ----- settings: API integration -----
  getAPIConfigs(): LOBAPIConfig[] {
    return [
      {
        lob: 'Fuel',
        enabled: true,
        credentials: {
          apiKey: 'woqod_fuel_ak_2024_xJ9k2mP8vN4qR7sT',
          secretKey: 'woqod_fuel_sk_2024_L5wH3eY6zM1nB9fK',
          createdAt: '2024-03-15',
          lastUsed: '2024-05-22',
          status: 'Active',
        },
        availableEndpoints: [
          {
            endpointId: 'EP-001',
            name: 'Get Vehicles List',
            category: 'Vehicles',
            method: 'GET',
            path: '/api/v1/fuel/vehicles',
            description: 'Retrieve list of all vehicles registered under Fuel LOB',
            requiresAuth: true,
            rateLimit: '100 requests/hour',
          },
          {
            endpointId: 'EP-002',
            name: 'Get Consumption Data',
            category: 'Consumption',
            method: 'GET',
            path: '/api/v1/fuel/consumption',
            description: 'Get fuel consumption data by vehicle or date range',
            requiresAuth: true,
            rateLimit: '100 requests/hour',
          },
          {
            endpointId: 'EP-003',
            name: 'Get Billing Information',
            category: 'Billing',
            method: 'GET',
            path: '/api/v1/fuel/billing',
            description: 'Retrieve billing statements and invoice data',
            requiresAuth: true,
            rateLimit: '50 requests/hour',
          },
          {
            endpointId: 'EP-004',
            name: 'Get Transactions',
            category: 'Transactions',
            method: 'GET',
            path: '/api/v1/fuel/transactions',
            description: 'Fetch transaction history for fuel purchases',
            requiresAuth: true,
            rateLimit: '100 requests/hour',
          },
        ],
        webhookUrl: 'https://hadad-medical.com/webhooks/woqod-fuel',
      },
      {
        lob: 'APC',
        enabled: true,
        credentials: {
          apiKey: 'woqod_apc_ak_2024_A8k5pM2vB7qT9sL',
          secretKey: 'woqod_apc_sk_2024_W3eG6zJ1nF8hK4m',
          createdAt: '2024-04-10',
          status: 'Active',
        },
        availableEndpoints: [
          {
            endpointId: 'EP-005',
            name: 'Get Aircraft Fleet',
            category: 'Fleet',
            method: 'GET',
            path: '/api/v1/apc/fleet',
            description: 'Retrieve aircraft fleet information',
            requiresAuth: true,
            rateLimit: '50 requests/hour',
          },
          {
            endpointId: 'EP-006',
            name: 'Get Aviation Fuel Consumption',
            category: 'Consumption',
            method: 'GET',
            path: '/api/v1/apc/consumption',
            description: 'Get aviation fuel consumption by aircraft',
            requiresAuth: true,
            rateLimit: '50 requests/hour',
          },
          {
            endpointId: 'EP-007',
            name: 'Get APC Billing',
            category: 'Billing',
            method: 'GET',
            path: '/api/v1/apc/billing',
            description: 'Aviation fuel billing and invoices',
            requiresAuth: true,
            rateLimit: '30 requests/hour',
          },
        ],
      },
      {
        lob: 'Bulk Fuel',
        enabled: false,
        credentials: null,
        availableEndpoints: [
          {
            endpointId: 'EP-008',
            name: 'Get Bulk Deliveries',
            category: 'Transactions',
            method: 'GET',
            path: '/api/v1/bulk/deliveries',
            description: 'Retrieve bulk fuel delivery records',
            requiresAuth: true,
            rateLimit: '50 requests/hour',
          },
          {
            endpointId: 'EP-009',
            name: 'Get Bulk Consumption',
            category: 'Consumption',
            method: 'GET',
            path: '/api/v1/bulk/consumption',
            description: 'Industrial fuel consumption data',
            requiresAuth: true,
            rateLimit: '50 requests/hour',
          },
          {
            endpointId: 'EP-010',
            name: 'Get Bulk Billing',
            category: 'Billing',
            method: 'GET',
            path: '/api/v1/bulk/billing',
            description: 'Bulk fuel billing information',
            requiresAuth: true,
            rateLimit: '30 requests/hour',
          },
        ],
      },
    ];
  }

  saveAPIConfig(config: LOBAPIConfig): void {
    const settings = this.getSettingsState();
    if (settings) {
      const index = settings.apiConfigs.findIndex(c => c.lob === config.lob);
      if (index >= 0) {
        settings.apiConfigs[index] = config;
      } else {
        settings.apiConfigs.push(config);
      }
      this.updateSettings(settings);
    }
  }

  // ----- Open API: Customer API Credentials -----
  getCustomerAPICredential(): CustomerAPICredential | null {
    const stored = this.getFromStorage<CustomerAPICredential>('apiCredential');
    if (stored) {
      this._apiCredential$.next(stored);
      return stored;
    }
    return this._apiCredential$.value;
  }

  generateCustomerAPICredential(): CustomerAPICredential {
    const customer = this.getCustomer();
    const user = this._currentUser$.value;
    const now = new Date().toISOString();

    // Generate API Key (visible, not hashed)
    const apiKey = `csp_${customer.customerCode}_${Date.now()}_${this.randomString(16)}`;

    // Generate Secret Key (only shown once, then hashed)
    const plainSecret = `csp_secret_${Date.now()}_${this.randomString(32)}`;

    // In a real app, this would be bcrypt.hashSync(plainSecret, 10)
    // For this prototype, we'll use a simple prefix to indicate it's hashed
    const secretHash = `$2b$10$${this.randomString(53)}`; // Mock bcrypt hash format

    const credential: CustomerAPICredential = {
      id: `CRED-${Date.now()}`,
      customerId: customer.customerId,
      apiKey,
      secretHash,
      plainSecret, // Only available during generation
      status: 'Active',
      isEnabled: true,
      createdAt: now,
      createdBy: user?.fullName ?? 'System',
    };

    this._apiCredential$.next(credential);
    this.saveToStorage('apiCredential', credential);

    return credential;
  }

  regenerateCustomerAPICredential(): CustomerAPICredential {
    const oldCredential = this.getCustomerAPICredential();
    const customer = this.getCustomer();
    const user = this._currentUser$.value;
    const now = new Date().toISOString();

    const apiKey = `csp_${customer.customerCode}_${Date.now()}_${this.randomString(16)}`;
    const plainSecret = `csp_secret_${Date.now()}_${this.randomString(32)}`;
    const secretHash = `$2b$10$${this.randomString(53)}`;

    const credential: CustomerAPICredential = {
      id: `CRED-${Date.now()}`,
      customerId: customer.customerId,
      apiKey,
      secretHash,
      plainSecret,
      status: 'Active',
      isEnabled: true,
      createdAt: now,
      createdBy: user?.fullName ?? 'System',
      regeneratedFromId: oldCredential?.id,
      remarks: 'Regenerated by user',
    };

    this._apiCredential$.next(credential);
    this.saveToStorage('apiCredential', credential);

    return credential;
  }

  revokeCustomerAPICredential(): void {
    const credential = this.getCustomerAPICredential();
    if (credential) {
      const user = this._currentUser$.value;
      credential.status = 'Revoked';
      credential.revokedAt = new Date().toISOString();
      credential.revokedBy = user?.fullName ?? 'System';
      delete credential.plainSecret; // Remove plain secret if somehow still present

      this._apiCredential$.next(credential);
      this.saveToStorage('apiCredential', credential);
    }
  }

  updateAPICredentialLastUsed(): void {
    const credential = this.getCustomerAPICredential();
    if (credential) {
      credential.lastUsedAt = new Date().toISOString();
      this._apiCredential$.next(credential);
      this.saveToStorage('apiCredential', credential);
    }
  }

  // ----- Open API: Mock Invoice Data -----
  getMockInvoices(customerId?: string): Invoice[] {
    const custId = customerId ?? this.getCustomer().customerId;

    return [
      {
        invoiceNumber: 'INV-2024-05-0123',
        customerId: custId,
        customerName: this.getCustomer().customerName,
        invoiceDate: '2024-05-01',
        dueDate: '2024-05-31',
        status: 'Paid',
        subtotal: 12500.00,
        taxAmount: 625.00,
        totalAmount: 13125.00,
        paidAmount: 13125.00,
        balanceAmount: 0,
        currency: 'QAR',
        paymentTerms: 'Net 30',
        billingPeriodStart: '2024-04-01',
        billingPeriodEnd: '2024-04-30',
        createdAt: '2024-05-01T08:00:00Z',
        lines: [
          {
            lineNumber: 1,
            description: 'Premium Fuel - Vehicle #QAT-12345',
            quantity: 500,
            unitPrice: 10.00,
            lineTotal: 5000.00,
            taxAmount: 250.00,
            category: 'Fuel',
          },
          {
            lineNumber: 2,
            description: 'Diesel - Vehicle #QAT-67890',
            quantity: 750,
            unitPrice: 8.00,
            lineTotal: 6000.00,
            taxAmount: 300.00,
            category: 'Fuel',
          },
          {
            lineNumber: 3,
            description: 'Petrol - Vehicle #QAT-54321',
            quantity: 300,
            unitPrice: 5.00,
            lineTotal: 1500.00,
            taxAmount: 75.00,
            category: 'Fuel',
          },
        ],
      },
      {
        invoiceNumber: 'INV-2024-04-0087',
        customerId: custId,
        customerName: this.getCustomer().customerName,
        invoiceDate: '2024-04-01',
        dueDate: '2024-04-30',
        status: 'Paid',
        subtotal: 18750.00,
        taxAmount: 937.50,
        totalAmount: 19687.50,
        paidAmount: 19687.50,
        balanceAmount: 0,
        currency: 'QAR',
        paymentTerms: 'Net 30',
        billingPeriodStart: '2024-03-01',
        billingPeriodEnd: '2024-03-31',
        createdAt: '2024-04-01T08:00:00Z',
        lines: [
          {
            lineNumber: 1,
            description: 'Premium Fuel - Fleet Consumption',
            quantity: 1250,
            unitPrice: 10.00,
            lineTotal: 12500.00,
            taxAmount: 625.00,
            category: 'Fuel',
          },
          {
            lineNumber: 2,
            description: 'Diesel - Fleet Consumption',
            quantity: 780,
            unitPrice: 8.00,
            lineTotal: 6250.00,
            taxAmount: 312.50,
            category: 'Fuel',
          },
        ],
      },
      {
        invoiceNumber: 'INV-2024-03-0054',
        customerId: custId,
        customerName: this.getCustomer().customerName,
        invoiceDate: '2024-03-01',
        dueDate: '2024-03-31',
        status: 'Pending',
        subtotal: 8400.00,
        taxAmount: 420.00,
        totalAmount: 8820.00,
        paidAmount: 0,
        balanceAmount: 8820.00,
        currency: 'QAR',
        paymentTerms: 'Net 30',
        billingPeriodStart: '2024-02-01',
        billingPeriodEnd: '2024-02-29',
        createdAt: '2024-03-01T08:00:00Z',
        lines: [
          {
            lineNumber: 1,
            description: 'Petrol - Vehicle #QAT-12345',
            quantity: 420,
            unitPrice: 20.00,
            lineTotal: 8400.00,
            taxAmount: 420.00,
            category: 'Fuel',
          },
        ],
      },
    ];
  }

  getInvoiceByNumber(invoiceNumber: string, customerId?: string): Invoice | null {
    const invoices = this.getMockInvoices(customerId);
    return invoices.find(inv => inv.invoiceNumber === invoiceNumber) ?? null;
  }

  // ----- Open API: Mock Vehicle Data -----
  getMockVehicles(customerId?: string): Vehicle[] {
    const custId = customerId ?? this.getCustomer().customerId;

    return [
      {
        vehicleId: 'VEH-001',
        customerId: custId,
        vehicleNumber: 'QAT-12345',
        vehicleType: 'Car',
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        color: 'White',
        fuelType: 'Petrol',
        status: 'Active',
        registrationDate: '2022-01-15',
        driverName: 'Ahmed Al-Mohannadi',
        driverPhone: '+974-5555-1234',
        assignedLOB: 'Fuel',
        dailyLimit: 500.00,
        monthlyLimit: 15000.00,
        currentMonthUsage: 8500.00,
        lastTransactionDate: '2024-05-21',
        createdAt: '2022-01-15T10:00:00Z',
      },
      {
        vehicleId: 'VEH-002',
        customerId: custId,
        vehicleNumber: 'QAT-67890',
        vehicleType: 'Truck',
        make: 'Mercedes',
        model: 'Actros',
        year: 2021,
        color: 'Blue',
        fuelType: 'Diesel',
        status: 'Active',
        registrationDate: '2021-06-10',
        driverName: 'Mohammed Hassan',
        driverPhone: '+974-5555-5678',
        assignedLOB: 'Fuel',
        dailyLimit: 800.00,
        monthlyLimit: 24000.00,
        currentMonthUsage: 15200.00,
        lastTransactionDate: '2024-05-22',
        createdAt: '2021-06-10T10:00:00Z',
      },
      {
        vehicleId: 'VEH-003',
        customerId: custId,
        vehicleNumber: 'QAT-54321',
        vehicleType: 'Van',
        make: 'Ford',
        model: 'Transit',
        year: 2023,
        color: 'Silver',
        fuelType: 'Diesel',
        status: 'Suspended',
        registrationDate: '2023-03-20',
        driverName: 'Sara Al-Khater',
        driverPhone: '+974-5555-9012',
        assignedLOB: 'Fuel',
        dailyLimit: 400.00,
        monthlyLimit: 12000.00,
        currentMonthUsage: 0,
        lastTransactionDate: '2024-04-10',
        createdAt: '2023-03-20T10:00:00Z',
      },
      {
        vehicleId: 'VEH-004',
        customerId: custId,
        vehicleNumber: 'QAT-11111',
        vehicleType: 'Car',
        make: 'Honda',
        model: 'Accord',
        year: 2020,
        color: 'Black',
        fuelType: 'Premium',
        status: 'Inactive',
        registrationDate: '2020-08-05',
        driverName: 'Fatima Al-Sulaiti',
        driverPhone: '+974-5555-3456',
        assignedLOB: 'Fuel',
        dailyLimit: 300.00,
        monthlyLimit: 9000.00,
        currentMonthUsage: 0,
        lastTransactionDate: '2023-12-15',
        createdAt: '2020-08-05T10:00:00Z',
      },
    ];
  }

  getVehicleByNumber(vehicleNumber: string, customerId?: string): Vehicle | null {
    const vehicles = this.getMockVehicles(customerId);
    return vehicles.find(v => v.vehicleNumber === vehicleNumber) ?? null;
  }

  // ----- Open API: Mock Consumption Data -----
  getMockConsumptionTransactions(customerId?: string): ConsumptionTransaction[] {
    const custId = customerId ?? this.getCustomer().customerId;

    return [
      {
        transactionId: 'TXN-2024-05-0245',
        customerId: custId,
        vehicleId: 'VEH-001',
        vehicleNumber: 'QAT-12345',
        stationCode: 'STN-001',
        stationName: 'WOQOD Petrol Station - Doha Main',
        fuelType: 'Petrol',
        quantity: 45.5,
        unitPrice: 2.10,
        totalAmount: 95.55,
        transactionDate: '2024-05-21',
        transactionTime: '14:35:00',
        driverName: 'Ahmed Al-Mohannadi',
        odometerReading: 45230,
        latitude: 25.2854,
        longitude: 51.5310,
        createdAt: '2024-05-21T14:35:00Z',
      },
      {
        transactionId: 'TXN-2024-05-0244',
        customerId: custId,
        vehicleId: 'VEH-002',
        vehicleNumber: 'QAT-67890',
        stationCode: 'STN-003',
        stationName: 'WOQOD Diesel Station - Industrial Area',
        fuelType: 'Diesel',
        quantity: 120.0,
        unitPrice: 1.80,
        totalAmount: 216.00,
        transactionDate: '2024-05-22',
        transactionTime: '08:15:00',
        driverName: 'Mohammed Hassan',
        odometerReading: 89450,
        latitude: 25.2048,
        longitude: 51.4326,
        createdAt: '2024-05-22T08:15:00Z',
      },
      {
        transactionId: 'TXN-2024-05-0230',
        customerId: custId,
        vehicleId: 'VEH-001',
        vehicleNumber: 'QAT-12345',
        stationCode: 'STN-005',
        stationName: 'WOQOD Station - Al Sadd',
        fuelType: 'Petrol',
        quantity: 38.2,
        unitPrice: 2.10,
        totalAmount: 80.22,
        transactionDate: '2024-05-18',
        transactionTime: '17:45:00',
        driverName: 'Ahmed Al-Mohannadi',
        odometerReading: 44950,
        latitude: 25.2765,
        longitude: 51.5272,
        createdAt: '2024-05-18T17:45:00Z',
      },
      {
        transactionId: 'TXN-2024-05-0210',
        customerId: custId,
        vehicleId: 'VEH-002',
        vehicleNumber: 'QAT-67890',
        stationCode: 'STN-003',
        stationName: 'WOQOD Diesel Station - Industrial Area',
        fuelType: 'Diesel',
        quantity: 95.5,
        unitPrice: 1.80,
        totalAmount: 171.90,
        transactionDate: '2024-05-15',
        transactionTime: '09:20:00',
        driverName: 'Mohammed Hassan',
        odometerReading: 88920,
        latitude: 25.2048,
        longitude: 51.4326,
        createdAt: '2024-05-15T09:20:00Z',
      },
      {
        transactionId: 'TXN-2024-05-0195',
        customerId: custId,
        vehicleId: 'VEH-001',
        vehicleNumber: 'QAT-12345',
        stationCode: 'STN-001',
        stationName: 'WOQOD Petrol Station - Doha Main',
        fuelType: 'Petrol',
        quantity: 42.0,
        unitPrice: 2.10,
        totalAmount: 88.20,
        transactionDate: '2024-05-12',
        transactionTime: '16:10:00',
        driverName: 'Ahmed Al-Mohannadi',
        odometerReading: 44620,
        latitude: 25.2854,
        longitude: 51.5310,
        createdAt: '2024-05-12T16:10:00Z',
      },
    ];
  }

  getConsumptionSummary(fromDate?: string, toDate?: string, customerId?: string): ConsumptionSummary {
    const custId = customerId ?? this.getCustomer().customerId;
    const transactions = this.getMockConsumptionTransactions(custId);

    return {
      customerId: custId,
      periodStart: fromDate ?? '2024-05-01',
      periodEnd: toDate ?? '2024-05-22',
      totalTransactions: transactions.length,
      totalQuantity: transactions.reduce((sum, t) => sum + t.quantity, 0),
      totalAmount: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
      currency: 'QAR',
      byFuelType: [
        {
          fuelType: 'Petrol',
          transactions: 3,
          quantity: 125.7,
          amount: 263.97,
        },
        {
          fuelType: 'Diesel',
          transactions: 2,
          quantity: 215.5,
          amount: 387.90,
        },
      ],
      byVehicle: [
        {
          vehicleId: 'VEH-001',
          vehicleNumber: 'QAT-12345',
          transactions: 3,
          quantity: 125.7,
          amount: 263.97,
        },
        {
          vehicleId: 'VEH-002',
          vehicleNumber: 'QAT-67890',
          transactions: 2,
          quantity: 215.5,
          amount: 387.90,
        },
      ],
      topStations: [
        {
          stationCode: 'STN-003',
          stationName: 'WOQOD Diesel Station - Industrial Area',
          transactions: 2,
          amount: 387.90,
        },
        {
          stationCode: 'STN-001',
          stationName: 'WOQOD Petrol Station - Doha Main',
          transactions: 2,
          amount: 183.75,
        },
        {
          stationCode: 'STN-005',
          stationName: 'WOQOD Station - Al Sadd',
          transactions: 1,
          amount: 80.22,
        },
      ],
    };
  }

  // ----- Open API: Request Logging -----
  logAPIRequest(log: Omit<APIRequestLog, 'id' | 'createdAt'>): void {
    const logEntry: APIRequestLog = {
      ...log,
      id: `LOG-${Date.now()}-${this.randomString(8)}`,
      createdAt: new Date().toISOString(),
    };

    const logs = [logEntry, ...this._apiRequestLogs$.value].slice(0, 1000); // Keep last 1000 logs
    this._apiRequestLogs$.next(logs);
    this.saveToStorage('apiRequestLogs', logs);
  }

  getAPIRequestLogs(limit?: number): APIRequestLog[] {
    const logs = this.getFromStorage<APIRequestLog[]>('apiRequestLogs') ?? [];
    if (logs.length > 0) {
      this._apiRequestLogs$.next(logs);
    }
    return limit ? logs.slice(0, limit) : logs;
  }

  // ----- Open API: Rate Limiting -----
  checkRateLimit(apiKey: string, maxRequestsPerMinute: number = 100): boolean {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute ago

    let entries = this._rateLimitEntries$.value;

    // Clean up old entries
    entries = entries.filter(e => e.windowStart > windowStart);

    // Find entry for this API key
    const entry = entries.find(e => e.apiKey === apiKey && e.windowStart > windowStart);

    if (!entry) {
      // First request in this window
      entries.push({ apiKey, windowStart: now, requestCount: 1 });
      this._rateLimitEntries$.next(entries);
      return true;
    }

    if (entry.requestCount >= maxRequestsPerMinute) {
      return false; // Rate limit exceeded
    }

    // Increment count
    entry.requestCount++;
    this._rateLimitEntries$.next(entries);
    return true;
  }

  // ----- Home Page: Banners -----
  getHomeBanners(): HomeBanner[] {
    const now = new Date().toISOString();
    const banners: HomeBanner[] = [
      {
        id: 'BANNER-001',
        title: 'Welcome to WOQOD',
        subtitle: 'Qatar\'s Leading National Fuel Company',
        imageUrl: 'assets/images/banners/banner-1.png',
        redirectUrl: '/csp/services',
        displayOrder: 1,
        isActive: true,
        startDate: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'BANNER-002',
        title: 'WOQOD Total Control',
        subtitle: 'Your comprehensive fuel management solution',
        imageUrl: 'assets/images/banners/banner-2.jpg',
        displayOrder: 2,
        isActive: true,
        startDate: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'BANNER-003',
        title: 'Explore Our Services',
        subtitle: 'Retail, Bulk Fuel, Aviation, and more',
        imageUrl: 'assets/images/banners/banner-3.jpg',
        displayOrder: 3,
        isActive: true,
        startDate: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    return banners.filter(banner => {
      if (!banner.isActive) return false;
      if (banner.endDate && banner.endDate < now) return false;
      return true;
    });
  }

  // ----- Home Page: News -----
  getNews(): News[] {
    return [
      {
        id: 'NEWS-001',
        title: 'WOQOD Announces New Service Expansion',
        description: 'We are pleased to announce the expansion of our services to new locations across Qatar.',
        details: 'WOQOD is expanding its service network with 5 new stations opening in Q3 2024. This expansion will bring our total station count to over 100 across Qatar, ensuring better coverage and accessibility for all our customers.',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
        publishDate: '2024-05-20',
        displayOrder: 1,
        isActive: true,
        createdAt: '2026-05-20T00:00:00Z',
      },
      {
        id: 'NEWS-002',
        title: 'Price Adjustment Notice',
        description: 'Fuel prices will be adjusted effective June 1st, 2024.',
        details: 'In accordance with global market trends, WOQOD will implement a price adjustment for all fuel products effective June 1st, 2024. Premium petrol will be adjusted to QAR 2.15/liter, Regular petrol to QAR 2.05/liter, and Diesel to QAR 2.00/liter.',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
        publishDate: '2024-05-18',
        displayOrder: 2,
        isActive: true,
        createdAt: '2026-05-18T00:00:00Z',
      },
      {
        id: 'NEWS-003',
        title: 'New Mobile App Launch',
        description: 'Download our new mobile app for convenient access to all WOQOD services.',
        details: 'WOQOD is excited to announce the launch of our new mobile application, available on iOS and Android. The app provides real-time access to your account, station locator, price updates, and exclusive promotions.',
        imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
        publishDate: '2024-05-15',
        displayOrder: 3,
        isActive: true,
        createdAt: '2026-05-15T00:00:00Z',
      },
      {
        id: 'NEWS-004',
        title: 'Sustainability Initiative Launch',
        description: 'WOQOD commits to reducing carbon emissions by 30% by 2030.',
        details: 'As part of our commitment to environmental sustainability, WOQOD announces a comprehensive green initiative aimed at reducing carbon emissions across all operations by 30% by 2030. This includes investment in renewable energy, electric vehicle charging infrastructure, and eco-friendly fuel alternatives.',
        imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop',
        publishDate: '2024-05-12',
        displayOrder: 4,
        isActive: true,
        createdAt: '2026-05-12T00:00:00Z',
      },
      {
        id: 'NEWS-005',
        title: 'Customer Loyalty Program Enhanced',
        description: 'New rewards and benefits added to our loyalty program for valued customers.',
        details: 'WOQOD is pleased to announce significant enhancements to our customer loyalty program. New benefits include double points on weekends, exclusive discounts on services, and priority access to new products. Existing members will automatically receive upgraded benefits.',
        imageUrl: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&h=600&fit=crop',
        publishDate: '2024-05-10',
        displayOrder: 5,
        isActive: true,
        createdAt: '2026-05-10T00:00:00Z',
      },
      {
        id: 'NEWS-006',
        title: 'Partnership with Qatar Airways',
        description: 'WOQOD signs strategic partnership agreement with Qatar Airways for aviation fuel supply.',
        details: 'WOQOD and Qatar Airways have entered into a long-term strategic partnership for the supply of aviation fuel. This collaboration strengthens our position as Qatar\'s leading fuel provider and ensures reliable, high-quality fuel supply for one of the world\'s premier airlines.',
        imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop',
        publishDate: '2024-05-08',
        displayOrder: 6,
        isActive: true,
        createdAt: '2024-05-08T00:00:00Z',
      },
    ].filter(news => news.isActive);
  }

  getNewsById(id: string): News | null {
    return this.getNews().find(news => news.id === id) ?? null;
  }

  // ----- Home Page: Tenders -----
  getTenders(): Tender[] {
    const now = new Date().toISOString();
    const nowDate = now.split('T')[0];
    console.log('Current date for filtering:', nowDate);
    const allTenders = [
      {
        id: 'TENDER-001',
        tenderTitle: 'Supply of Premium Unleaded Gasoline - Annual Contract 2026-2027',
        tenderReferenceNo: 'WOQOD/2026/TND/001',
        description: 'WOQOD invites qualified suppliers to submit competitive bids for the supply of premium unleaded gasoline (RON 97) for the contract period 2026-2027.',
        details: `TENDER NOTICE - SUPPLY OF PREMIUM UNLEADED GASOLINE

WOQOD (Qatar Fuel) Q.P.S.C., the national fuel company of the State of Qatar, invites qualified and experienced suppliers to submit their competitive bids for the Supply of Premium Unleaded Gasoline (RON 97) for the contract period 2026-2027.

SCOPE OF WORK:
• Supply of Premium Unleaded Gasoline conforming to Qatar Standard QS 5/2019
• Estimated annual quantity: 75 million liters
• Delivery to WOQOD storage terminals across Qatar
• Quality testing and certification as per Qatar specifications
• Emergency supply arrangements during peak demand periods

CONTRACT DETAILS:
• Contract Duration: 12 months (July 2024 - June 2025)
• Option to extend for an additional 12 months subject to performance
• Estimated Contract Value: QAR 180 Million
• Payment Terms: Net 30 days from invoice date
• Performance Bond: 10% of contract value

ELIGIBILITY CRITERIA:
• Minimum 5 years experience in petroleum products supply
• ISO 9001:2015 Quality Management System certification
• Proven track record of supplying minimum 50 million liters annually
• Financial capacity and credit rating requirements as per tender documents
• Valid commercial registration in Qatar or ability to establish local presence

KEY DATES:
• Tender Document Sale: May 20, 2024 - June 15, 2024
• Pre-Bid Meeting: June 5, 2024 at 10:00 AM (WOQOD Head Office)
• Last Date for Queries: June 18, 2024
• Bid Submission Deadline: June 30, 2024 at 2:00 PM
• Technical Evaluation: July 1-10, 2024
• Commercial Evaluation: July 11-15, 2024
• Award Notification: July 25, 2024

For more information, please contact:
WOQOD Procurement Department
Tel: +974 4013 0000
Email: procurement@woqod.com.qa
Website: www.woqod.com.qa`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1474377207190-a7d8b3334068?w=800&h=600&fit=crop',
        closingDate: '2026-06-30',
        tenderUrl: 'https://woqod.qa/tenders/2024-001.pdf',
        displayOrder: 1,
        isActive: true,
        createdAt: '2026-05-10T00:00:00Z',
      },
      {
        id: 'TENDER-002',
        tenderTitle: 'Comprehensive Maintenance Services for Fuel Station Network',
        tenderReferenceNo: 'WOQOD/2026/TND/002',
        description: 'WOQOD seeks qualified contractors to provide comprehensive preventive and corrective maintenance services for our extensive network of 100+ fuel stations across Qatar.',
        details: `TENDER NOTICE - FUEL STATION MAINTENANCE SERVICES

WOQOD (Qatar Fuel) Q.P.S.C. invites qualified maintenance service providers to submit proposals for comprehensive maintenance services across our network of fuel stations in Qatar.

SCOPE OF SERVICES:
1. Preventive Maintenance: Fuel dispensing equipment, underground storage tanks, fire safety systems, electrical systems, HVAC, forecourt maintenance
2. Corrective Maintenance: Emergency breakdown response (24/7/365), equipment repair and replacement, troubleshooting
3. Compliance & Safety: Regular safety inspections, environmental compliance monitoring, documentation

COVERAGE AREAS:
• Doha Metropolitan Area: 45 stations
• Northern Region: 25 stations
• Southern Region: 20 stations
• Western Region: 15 stations

CONTRACT DETAILS:
• Contract Duration: 24 months
• Contract Start Date: September 1, 2024
• Estimated Contract Value: QAR 15 Million per annum
• Response time: 2 hours for critical issues, 4 hours for non-critical
• Minimum 98% equipment uptime guarantee

BIDDER QUALIFICATIONS:
• Minimum 7 years experience in fuel station maintenance
• ISO 9001, ISO 14001, and ISO 45001 certifications
• QHSE management system implementation
• Trained and certified technicians (minimum 20 full-time staff)
• 24/7 emergency response capability

KEY DATES:
• Site Visit Dates: May 25-30, 2024 (mandatory)
• Pre-Bid Meeting: June 3, 2024 at 11:00 AM
• Bid Submission Deadline: July 15, 2024 at 3:00 PM
• Contract Award: August 15, 2024

For tender documents and registration:
WOQOD Facilities Management Department
Tel: +974 4013 0200
Email: facilities@woqod.com.qa`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
        closingDate: '2026-07-15',
        tenderUrl: 'https://woqod.qa/tenders/2024-002.pdf',
        displayOrder: 2,
        isActive: true,
        createdAt: '2026-05-12T00:00:00Z',
      },
      {
        id: 'TENDER-003',
        tenderTitle: 'Enterprise IT Infrastructure Modernization & Cloud Migration',
        tenderReferenceNo: 'WOQOD/2026/TND/003',
        description: 'WOQOD seeks proposals from qualified IT service providers for a comprehensive enterprise IT infrastructure upgrade, including data center modernization, network enhancement, cybersecurity implementation, and cloud migration services.',
        details: `TENDER NOTICE - IT INFRASTRUCTURE MODERNIZATION

WOQOD (Qatar Fuel) Q.P.S.C. invites proposals from qualified IT service providers for a comprehensive modernization of our enterprise IT infrastructure to support our digital transformation initiatives.

PROJECT SCOPE:
1. Data Center Modernization: Hyperconverged infrastructure, software-defined networking, SAN enhancement, disaster recovery
2. Network Infrastructure Enhancement: Core network upgrade to 100 Gbps, SD-WAN across 100+ sites, Wi-Fi 6 deployment
3. Cybersecurity Solutions: Next-gen firewall, SIEM, DLP system, MFA rollout, SOC establishment
4. Cloud Migration Services: Cloud readiness assessment, hybrid cloud architecture, migration of 50+ applications
5. Integration & Support: SAP integration, fuel management systems, mobile infrastructure, 24/7 managed services

TECHNICAL SPECIFICATIONS:
• Must support 2,000+ concurrent users
• 99.99% uptime SLA for critical systems
• Compliance with Qatar's National Cybersecurity Framework
• ISO 27001 information security standards

PROJECT TIMELINE:
• Total Project Duration: 14 months
• Design & Planning: 2 months
• Implementation: 6 months
• Testing & UAT: 1 month
• Hypercare Support: 3 months

BUDGET:
• Estimated Project Value: QAR 25 Million
• Payment Structure: Milestone-based
• Warranty Period: 12 months post go-live

VENDOR QUALIFICATIONS:
• Minimum 10 years experience in enterprise IT projects
• ISO 9001, ISO 27001, ISO 20000 certifications
• Partnerships with leading vendors (Cisco, VMware, Microsoft, AWS/Azure)
• Local presence in Qatar with minimum 50 IT professionals

KEY DATES:
• Pre-Bid Conference: June 10, 2024 (Virtual)
• Proposal Submission Deadline: August 20, 2024 at 12:00 PM
• Technical Presentations: September 2-6, 2024
• Contract Award: September 30, 2024

For RFP documents:
WOQOD IT Department
Email: it.procurement@woqod.com.qa
Tel: +974 4013 0300`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
        closingDate: '2026-08-20',
        tenderUrl: 'https://woqod.qa/tenders/2024-003.pdf',
        displayOrder: 3,
        isActive: true,
        createdAt: '2026-05-15T00:00:00Z',
      },
      {
        id: 'TENDER-004',
        tenderTitle: 'Procurement of Commercial Fleet Vehicles - 50 Units',
        tenderReferenceNo: 'WOQOD/2026/TND/004',
        description: 'WOQOD requires the supply of 50 commercial vehicles (heavy-duty trucks and cargo vans) for operational use across Qatar, including 3-year warranty and maintenance support.',
        details: `TENDER NOTICE - COMMERCIAL FLEET VEHICLE PROCUREMENT

WOQOD (Qatar Fuel) Q.P.S.C. invites bids from authorized vehicle suppliers/dealers for the supply of commercial vehicles to support our expanding operations.

VEHICLE REQUIREMENTS:

Category A - Heavy Duty Trucks (20 Units):
• Gross Vehicle Weight: 24,000 - 26,000 kg
• Engine: Euro 6 emission standard, Minimum 380 HP
• Purpose: Fuel transportation and logistics
• Special: Air conditioning, advanced safety features, ADR compliance

Category B - Medium Duty Trucks (15 Units):
• Gross Vehicle Weight: 8,000 - 10,000 kg
• Engine: Euro 6, Minimum 180 HP
• Purpose: Equipment and spare parts delivery
• Special: Hydraulic tail lift, GPS tracking, reverse camera

Category C - Cargo Vans (15 Units):
• Gross Vehicle Weight: 3,000 - 3,500 kg
• Engine: Euro 6, Diesel or Hybrid
• Purpose: General transport and maintenance crew
• Special: Shelving system, tool storage

DELIVERY & WARRANTY:
• Delivery Timeline: 6 months from contract award
• Warranty: 3 years or 150,000 km
• 24/7 breakdown assistance
• Authorized service center in Qatar (mandatory)

COMMERCIAL TERMS:
• Estimated Contract Value: QAR 12 Million
• Payment: 30% advance, 70% upon delivery
• Performance Bond: 5% of contract value

BIDDER QUALIFICATIONS:
• Authorized dealer/distributor of vehicle manufacturer
• Minimum 5 years operation in Qatar
• ISO 9001:2015 certified
• Previous supply to government entities (preferred)

KEY DATES:
• Vehicle Inspection: June 1-15, 2024
• Pre-Bid Meeting: June 10, 2024 at 2:00 PM
• Bid Submission Deadline: September 10, 2024 at 11:00 AM
• Contract Award: October 15, 2024

For tender documents:
WOQOD Fleet Management Department
Tel: +974 4013 0400
Email: fleet@woqod.com.qa`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&h=600&fit=crop',
        closingDate: '2026-09-10',
        tenderUrl: 'https://woqod.qa/tenders/2024-004.pdf',
        displayOrder: 4,
        isActive: true,
        createdAt: '2026-05-18T00:00:00Z',
      },
      {
        id: 'TENDER-005',
        tenderTitle: 'Construction of New Fuel Station - Al Khor North',
        tenderReferenceNo: 'WOQOD/2026/TND/005',
        description: 'WOQOD invites experienced contractors to submit bids for the design and construction of a new modern fuel station in Al Khor North area, including all civil, mechanical, and electrical works.',
        details: `TENDER NOTICE - NEW FUEL STATION CONSTRUCTION

WOQOD (Qatar Fuel) Q.P.S.C. invites qualified contractors to submit competitive bids for the design and construction of a modern fuel retail station in Al Khor North area.

SITE INFORMATION:
• Location: Al Khor North, Plot No. 125, Block 18
• Site Area: 5,000 square meters
• Direct access from main road (40m width)

SCOPE OF WORK:
1. Civil Works: Site preparation, underground fuel storage (4 tanks x 50,000L), fuel dispensing islands (8 dispensers), forecourt pavement, landscaping
2. Building Works: Convenience Store (150 sqm), Customer Rest Area, Prayer Room, Office Space, QSR Shell (100 sqm), Total Built-up: 510 sqm
3. Fuel System: Underground tanks, fuel dispensers, ATG system, leak detection, vapor recovery
4. Electrical & Mechanical: Main distribution (630 kVA), backup generator (250 kVA), LED lighting, HVAC, fire alarm, CCTV (20 cameras)
5. Specialized Systems: POS terminals, automatic car wash, digital signage, queue management
6. External Works: Canopy structure (1,200 sqm), signage, parking (20 spaces), landscaping

PROJECT TIMELINE:
• Design & Approval: 2 months
• Construction: 8 months
• Testing & Commissioning: 1 month
• Total Duration: 11 months

CONTRACTOR QUALIFICATIONS:
• Grade 1 or 2 classification (Ashghal/Qatar)
• Minimum 10 years in fuel station construction
• Portfolio of minimum 5 completed stations in Qatar/GCC
• ISO 9001, ISO 14001, ISO 45001 certifications

BUDGET & PAYMENT:
• Estimated Project Cost: QAR 18 Million
• Milestone-based payments
• Retention: 10%
• Performance Bond: 10%

KEY DATES:
• Site Visit (Mandatory): June 5-8, 2024
• Pre-Bid Meeting: June 12, 2024 at 10:00 AM
• Bid Submission Deadline: September 25, 2024 at 2:00 PM
• Contract Signing: November 15, 2024
• Project Completion: October 2025

For tender documents:
WOQOD Projects Department
Tel: +974 4013 0500
Email: projects@woqod.com.qa
Tender Fee: QAR 2,000 (non-refundable)`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
        closingDate: '2026-09-25',
        tenderUrl: 'https://woqod.qa/tenders/2024-005.pdf',
        displayOrder: 5,
        isActive: true,
        createdAt: '2026-05-20T00:00:00Z',
      },
    ];
    console.log('All tenders before filter:', allTenders.length);
    const filtered = allTenders.filter(tender => {
      const isActive = tender.isActive;
      const isNotExpired = tender.closingDate >= nowDate;
      console.log(`Tender ${tender.id}: active=${isActive}, closingDate=${tender.closingDate}, nowDate=${nowDate}, notExpired=${isNotExpired}`);
      return isActive && isNotExpired;
    });
    console.log('Filtered tenders:', filtered.length);
    return filtered;
  }

  getTenderById(id: string): Tender | null {
    return this.getTenders().find(tender => tender.id === id) ?? null;
  }

  // ----- Home Page: Services -----
  getWoqodServices(): WoqodService[] {
    const services: WoqodService[] = [
      {
        id: 'SVC-001',
        serviceCode: 'RETAIL' as ServiceCode,
        serviceName: 'Retail',
        description: 'Retail fuel services for individual and corporate customers',
        thumbnailUrl: 'assets/images/services/retail.jpg',
        dashboardRoute: '/csp/services/retail/dashboard',
        displayOrder: 1,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        subServices: [
          { name: 'WOQODe Tag', description: 'RFID-based automatic fuel payment for your fleet and vehicles.', icon: '🏷️', route: '/csp/services/retail/woqode', imageUrl: 'assets/images/services/retail/woqode-tag.jpg' },
          { name: 'Voucher Management', description: 'Generate fuel vouchers against your credit limit and assign them to drivers via SMS QR.', icon: '🎟️', route: '/csp/services/retail/vouchers', imageUrl: 'assets/images/services/retail/voucher.png' },
          { name: 'Autocare Services (APC)', description: 'Vehicle servicing, oil change, car wash and auto-parts care.', icon: '🔧', route: '/csp/services/retail/apc', imageUrl: 'assets/images/services/retail/autocare.jpg' },
          { name: 'Sidra Services', description: 'Convenience stores and retail offerings at WOQOD stations.', icon: '🛒', route: '/csp/services/retail/sidra', imageUrl: 'assets/images/services/retail/sidra.jpg' },
        ],
      },
      {
        id: 'SVC-002',
        serviceCode: 'BULK_FUEL' as ServiceCode,
        serviceName: 'Bulk Fuel',
        description: 'Large-scale fuel supply for industrial and commercial operations',
        thumbnailUrl: 'assets/images/services/bulk-fuel.jpg',
        dashboardRoute: '/csp/services/bulk-fuel/dashboard',
        displayOrder: 2,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'SVC-003',
        serviceCode: 'AVIATION' as ServiceCode,
        serviceName: 'Aviation',
        description: 'Aviation fuel services for airlines and private aircraft',
        thumbnailUrl: 'assets/images/services/aviation.jpg',
        dashboardRoute: '/csp/services/aviation/dashboard',
        displayOrder: 3,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'SVC-004',
        serviceCode: 'BUNKERING' as ServiceCode,
        serviceName: 'Bunkering',
        description: 'Marine fuel supply for vessels and ships',
        thumbnailUrl: 'assets/images/services/bunkering.jpg',
        dashboardRoute: '/csp/services/bunkering/dashboard',
        displayOrder: 4,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'SVC-005',
        serviceCode: 'BITUMEN' as ServiceCode,
        serviceName: 'Bitumen',
        description: 'Bitumen supply for construction and infrastructure projects',
        thumbnailUrl: 'assets/images/services/bitumen.jpg',
        dashboardRoute: '/csp/services/bitumen/dashboard',
        displayOrder: 5,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'SVC-006',
        serviceCode: 'FAHES' as ServiceCode,
        serviceName: 'Fahes',
        description: 'Comprehensive vehicle inspection and testing services',
        thumbnailUrl: 'assets/images/services/fahes.jpg',
        dashboardRoute: '/csp/services/fahes/dashboard',
        displayOrder: 6,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'SVC-007',
        serviceCode: 'BULK_GAS' as ServiceCode,
        serviceName: 'Bulk Gas',
        description: 'LPG and industrial gas supply services',
        thumbnailUrl: 'assets/images/services/bulk-gas.jpg',
        dashboardRoute: '/csp/services/bulk-gas/dashboard',
        displayOrder: 7,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'SVC-008',
        serviceCode: 'SHAFAF' as ServiceCode,
        serviceName: 'SHAFAF',
        description: 'Transparent fuel card management and monitoring system',
        thumbnailUrl: 'assets/images/services/shafaf.jpg',
        dashboardRoute: '/csp/services/shafaf/dashboard',
        displayOrder: 8,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'SVC-009',
        serviceCode: 'KENAR' as ServiceCode,
        serviceName: 'Kenar (Rental Shops)',
        description: 'Manage your rental shops, contracts, invoices, cheques and sales data',
        thumbnailUrl: 'assets/images/services/kenar.jpg',
        dashboardRoute: '/kenar/dashboard',
        displayOrder: 9,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        subServices: [
          { name: 'Dashboard', description: 'Overview of your rental shop operations.', icon: '📊', route: '/kenar/dashboard' },
          { name: 'My Shops', description: 'View and manage your rental shops.', icon: '🏪', route: '/kenar/shops' },
          { name: 'Contracts', description: 'Lease contracts and renewals.', icon: '📜', route: '/kenar/contracts' },
          { name: 'Rent & Invoices', description: 'Rent schedule and invoices.', icon: '🧾', route: '/kenar/invoices' },
          { name: 'Payments & Receipts', description: 'Payment history and receipts.', icon: '💳', route: '/kenar/payments' },
          { name: 'Sales Data', description: 'Upload and review sales data.', icon: '📈', route: '/kenar/sales-dashboard' },
        ],
      },
    ];

    return services.filter(service => service.isActive);
  }

  getServiceByCode(serviceCode: ServiceCode): WoqodService | null {
    return this.getWoqodServices().find(service => service.serviceCode === serviceCode) ?? null;
  }

  // ----- Home Page: Service Eligibility -----
  validateServiceEligibility(serviceCode: ServiceCode): ServiceEligibilityResponse {
    const customer = this.getCustomer();
    const service = this.getServiceByCode(serviceCode);

    if (!service) {
      return {
        success: false,
        isEligible: false,
        message: 'Service not found',
      };
    }

    // Check if customer has this service enabled
    // The customer.servicesEnabled array should contain the service codes
    const isEligible = customer.servicesEnabled.some(
      enabledService => enabledService.toUpperCase() === serviceCode
    );

    if (isEligible) {
      return {
        success: true,
        isEligible: true,
        message: 'Customer is eligible for this service',
        data: {
          serviceCode: service.serviceCode,
          serviceName: service.serviceName,
          dashboardRoute: service.dashboardRoute,
        },
      };
    } else {
      return {
        success: true,
        isEligible: false,
        message: 'Customer is not registered for this service',
        data: {
          serviceCode: service.serviceCode,
          serviceName: service.serviceName,
        },
      };
    }
  }

  // ----- Home Page: Service Interest -----
  recordServiceInterest(serviceCode: ServiceCode, serviceName: string): ServiceInterestResponse {
    const customer = this.getCustomer();
    const interests = this.getFromStorage<CustomerServiceInterest[]>('serviceInterests') ?? [];

    // Check if interest already exists for this customer and service
    const existingInterest = interests.find(
      interest =>
        interest.customerId === customer.customerId &&
        interest.serviceCode === serviceCode &&
        interest.status === 'INTERESTED'
    );

    if (existingInterest) {
      return {
        success: true,
        message: 'Your interest was already recorded. WOQOD team will contact you shortly.',
        data: existingInterest,
      };
    }

    // Create new interest record
    const newInterest: CustomerServiceInterest = {
      id: `INT-${Date.now()}`,
      customerId: customer.customerId,
      serviceCode,
      serviceName,
      status: 'INTERESTED',
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updatedInterests = [...interests, newInterest];
    this._serviceInterests$.next(updatedInterests);
    this.saveToStorage('serviceInterests', updatedInterests);

    return {
      success: true,
      message: 'Your interest has been recorded. WOQOD team will contact you shortly.',
      data: newInterest,
    };
  }

  getServiceInterests(): CustomerServiceInterest[] {
    const stored = this.getFromStorage<CustomerServiceInterest[]>('serviceInterests') ?? [];
    this._serviceInterests$.next(stored);
    return stored;
  }

  // ----- Home Page: Home Sections -----
  getHomeSections(): HomeSection[] {
    return [
      {
        code: 'NEWS',
        title: 'News',
        description: 'Latest announcements and updates from WOQOD.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop',
        route: '/csp/news',
      },
      {
        code: 'SERVICES',
        title: 'Services',
        description: 'Explore WOQOD services available for your account.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop',
        route: '/csp/services',
      },
      {
        code: 'TENDERS',
        title: 'Tenders',
        description: 'View available WOQOD tenders and related information.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop',
        route: '/csp/tenders',
      },
    ];
  }

  // ----- internal -----
  private initializeMockSession(): void {
    const customer = this.getCustomer();
    this._customer$.next(customer);
    this._currentUser$.next({
      username: 'sagar',
      fullName: 'Sagar Marthin',
      customerId: customer.customerId,
      customerCode: customer.customerCode,
      customerName: customer.customerName,
    });
  }

  private loadFromStorage(): void {
    const profileChanges = this.getFromStorage<ProfileChangeDraft>('profileChanges');
    const uploadedDocuments = this.getFromStorage<StagedDocumentMap>('uploadedDocuments');
    const submittedRequests = this.getFromStorage<CspRequest[]>('submittedRequests') ?? [];
    const users = this.getFromStorage<User[]>('users') ?? this.getMockUsers();
    const configurations = this.getFromStorage<ConfigurationFlow[]>('configurations') ?? this.getMockConfigurations();
    const vouchers = this.getFromStorage<Voucher[]>('vouchers') ?? this.getMockVouchers();
    const fleetVehicles = this.getFromStorage<FleetVehicle[]>('fleetVehicles') ?? this.getMockFleetVehicles();
    // Merge persisted settings onto current defaults so older/partial localStorage
    // (e.g. data saved before lobContacts/approvalFlows/apiConfigs existed) is backfilled
    // instead of leaving required fields undefined and throwing in the UI.
    const storedSettings = this.getFromStorage<SettingsState>('settingsState');
    const defaultSettings = this.getDefaultSettings();
    const settingsState: SettingsState = storedSettings
      ? {
          ...defaultSettings,
          ...storedSettings,
          notificationPreferences: storedSettings.notificationPreferences ?? defaultSettings.notificationPreferences,
          systemPreferences: storedSettings.systemPreferences ?? defaultSettings.systemPreferences,
          lobContacts: storedSettings.lobContacts ?? defaultSettings.lobContacts,
          approvalFlows: storedSettings.approvalFlows ?? defaultSettings.approvalFlows,
          apiConfigs: storedSettings.apiConfigs ?? defaultSettings.apiConfigs,
        }
      : defaultSettings;
    if (profileChanges) this._profileChanges$.next(profileChanges);
    if (uploadedDocuments) this._uploadedDocuments$.next(uploadedDocuments);
    this._submittedRequests$.next(submittedRequests);
    this._users$.next(users);
    this._configurations$.next(configurations);
    this._vouchers$.next(vouchers);
    this._fleetVehicles$.next(fleetVehicles);
    this._settingsState$.next(settingsState);
  }

  private saveToStorage(key: string, data: unknown): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}.${key}`, JSON.stringify(data));
    } catch {
      /* quota exceeded — silently ignore in this prototype */
    }
  }

  private getFromStorage<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}.${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

