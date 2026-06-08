// ===== CUSTOMER API CREDENTIALS =====

export interface CustomerAPICredential {
  id: string;
  customerId: string;
  apiKey: string;
  secretHash: string; // bcrypt hash of the secret key
  plainSecret?: string; // only populated immediately after generation, never stored
  status: 'Active' | 'Revoked' | 'Disabled';
  isEnabled: boolean;
  createdAt: string;
  createdBy: string;
  revokedAt?: string;
  revokedBy?: string;
  lastUsedAt?: string;
  regeneratedFromId?: string;
  remarks?: string;
}

// ===== INVOICE MODELS =====

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Cancelled' | 'Partial';

export interface InvoiceLine {
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  taxAmount: number;
  category: string;
}

export interface Invoice {
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  currency: string;
  paymentTerms: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  lines: InvoiceLine[];
  createdAt: string;
  updatedAt?: string;
}

// ===== VEHICLE MODELS =====

export type VehicleStatus = 'Active' | 'Suspended' | 'Terminated' | 'Inactive';
export type VehicleType = 'Car' | 'Truck' | 'Van' | 'Bus' | 'Motorcycle' | 'Other';
export type FuelType = 'Petrol' | 'Diesel' | 'Premium' | 'Super';

export interface Vehicle {
  vehicleId: string;
  customerId: string;
  vehicleNumber: string; // plate number
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: number;
  color?: string;
  fuelType: FuelType;
  status: VehicleStatus;
  registrationDate: string;
  expiryDate?: string;
  driverName?: string;
  driverPhone?: string;
  assignedLOB?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
  currentMonthUsage: number;
  lastTransactionDate?: string;
  createdAt: string;
  updatedAt?: string;
}

// ===== CONSUMPTION / TRANSACTION MODELS =====

export interface ConsumptionTransaction {
  transactionId: string;
  customerId: string;
  vehicleId: string;
  vehicleNumber: string;
  stationCode: string;
  stationName: string;
  fuelType: FuelType;
  quantity: number; // liters
  unitPrice: number;
  totalAmount: number;
  transactionDate: string;
  transactionTime: string;
  driverName?: string;
  odometerReading?: number;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface ConsumptionSummary {
  customerId: string;
  periodStart: string;
  periodEnd: string;
  totalTransactions: number;
  totalQuantity: number; // total liters
  totalAmount: number;
  currency: string;
  byFuelType: {
    fuelType: FuelType;
    transactions: number;
    quantity: number;
    amount: number;
  }[];
  byVehicle: {
    vehicleId: string;
    vehicleNumber: string;
    transactions: number;
    quantity: number;
    amount: number;
  }[];
  topStations: {
    stationCode: string;
    stationName: string;
    transactions: number;
    amount: number;
  }[];
}

// ===== API REQUEST LOG =====

export interface APIRequestLog {
  id: string;
  customerId: string;
  apiCredentialId: string;
  endpoint: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requestIp: string;
  userAgent: string;
  responseStatus: number;
  isSuccess: boolean;
  errorMessage?: string;
  executionTimeMs: number;
  createdAt: string;
}

// ===== RATE LIMIT TRACKING =====

export interface RateLimitEntry {
  apiKey: string;
  windowStart: number; // timestamp
  requestCount: number;
}

export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  enabled: boolean;
}

// ===== API RESPONSE FORMATS =====

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface APISuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface APIErrorResponse {
  success: false;
  message: string;
  errorCode: string;
}

export type APIResponse<T> = APISuccessResponse<T> | APIErrorResponse;

// ===== API ERROR CODES =====

export const API_ERROR_CODES = {
  INVALID_API_CREDENTIALS: 'INVALID_API_CREDENTIALS',
  MISSING_API_CREDENTIALS: 'MISSING_API_CREDENTIALS',
  REVOKED_CREDENTIALS: 'REVOKED_CREDENTIALS',
  DISABLED_API_ACCESS: 'DISABLED_API_ACCESS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  INVALID_PAGINATION: 'INVALID_PAGINATION',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type APIErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

// ===== API REQUEST HEADERS =====

export interface OpenAPIHeaders {
  'X-API-KEY': string;
  'X-API-SECRET': string;
}

// ===== QUERY PARAMETERS =====

export interface DateRangeParams {
  fromDate?: string; // ISO date string
  toDate?: string; // ISO date string
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface InvoiceQueryParams extends DateRangeParams, PaginationParams {
  status?: InvoiceStatus;
}

export interface ConsumptionQueryParams extends DateRangeParams, PaginationParams {
  vehicleNumber?: string;
}

export interface VehicleQueryParams extends PaginationParams {
  status?: VehicleStatus;
}
