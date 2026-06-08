// ===== HOME PAGE BANNERS =====

export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  redirectUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
}

// ===== NEWS / ANNOUNCEMENTS =====

export interface News {
  id: string;
  title: string;
  description: string;
  details: string;
  imageUrl: string;
  publishDate: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ===== TENDERS =====

export interface Tender {
  id: string;
  tenderTitle: string;
  tenderReferenceNo: string;
  description: string;
  details: string;
  thumbnailUrl: string;
  closingDate: string;
  tenderUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ===== SERVICES =====

export type ServiceCode =
  | 'RETAIL'
  | 'BULK_FUEL'
  | 'AVIATION'
  | 'BUNKERING'
  | 'BITUMEN'
  | 'FAHES'
  | 'BULK_GAS'
  | 'SHAFAF'
  | 'KENAR';

export interface SubService {
  name: string;
  description: string;
  icon: string;
  route: string;
  /** Optional thumbnail image; when present it replaces the emoji icon. */
  imageUrl?: string;
}

export interface WoqodService {
  id: string;
  serviceCode: ServiceCode;
  serviceName: string;
  description: string;
  thumbnailUrl: string;
  dashboardRoute: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  /** Optional sub-sections (e.g. Retail → WOQODe, APC, Sidra). */
  subServices?: SubService[];
}

// ===== CUSTOMER SERVICE INTEREST =====

export type ServiceInterestStatus = 'INTERESTED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface CustomerServiceInterest {
  id: string;
  customerId: string;
  serviceCode: ServiceCode;
  serviceName: string;
  status: ServiceInterestStatus;
  remarks?: string;
  requestedAt: string;
  createdAt: string;
  updatedAt?: string;
}

// ===== HOME PAGE SECTIONS =====

export interface HomeSection {
  code: 'NEWS' | 'SERVICES' | 'TENDERS';
  title: string;
  description: string;
  thumbnailUrl: string;
  route: string;
}

// ===== SERVICE ELIGIBILITY =====

export interface ServiceEligibilityRequest {
  serviceCode: ServiceCode;
}

export interface ServiceEligibilityResponse {
  success: boolean;
  isEligible: boolean;
  message: string;
  data?: {
    serviceCode: ServiceCode;
    serviceName: string;
    dashboardRoute?: string;
  };
}

export interface ServiceInterestRequest {
  serviceCode: ServiceCode;
  serviceName: string;
}

export interface ServiceInterestResponse {
  success: boolean;
  message: string;
  data?: CustomerServiceInterest;
}

// ===== HOME PAGE DATA =====

export interface HomePageData {
  banners: HomeBanner[];
  sections: HomeSection[];
}
