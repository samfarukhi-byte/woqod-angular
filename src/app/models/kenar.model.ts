// Kenar Tenant Portal Models

export interface TenantProfile {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  commercialRegistrationNumber: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  registeredAddress: string;
  accountStatus: 'Active' | 'Inactive' | 'Suspended';
  linkedShopsCount: number;
  createdDate: string;
}

export interface Shop {
  shopId: string;
  shopCode: string;
  stationName: string;
  stationCode: string;
  location: string;
  shopType: string;
  shopSize: number;
  contractStatus: 'Active' | 'Expiring Soon' | 'Expired' | 'Terminated';
  rentAmount: number;
  operationalStatus: 'Operational' | 'Under Maintenance' | 'Closed';
  contractReference?: string;
}

export interface ShopDetail extends Shop {
  contractStartDate: string;
  contractEndDate: string;
  securityDeposit: number;
  paymentFrequency: 'Monthly' | 'Quarterly' | 'Annually';
  utilityMeterDetails: {
    electricityMeter?: string;
    waterMeter?: string;
    coolingMeter?: string;
  };
  permittedBusinessActivity: string;
  woqodContactPerson: string;
  activeRequestsCount: number;
}

export interface Contract {
  contractId: string;
  contractNumber: string;
  shopCode: string;
  shopName: string;
  stationName: string;
  startDate: string;
  endDate: string;
  rentValue: number;
  paymentTerms: string;
  securityDeposit: number;
  contractStatus: 'Active' | 'Expiring Soon' | 'Expired' | 'Renewal Pending' | 'Terminated';
  renewalStatus?: 'Pending' | 'Approved' | 'Rejected';
  daysUntilExpiry?: number;
}

export interface RentInvoice {
  invoiceId: string;
  invoiceNumber: string;
  billingPeriod: string;
  shopCode: string;
  contractReference: string;
  dueDate: string;
  rentAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Pending' | 'Overdue';
  issueDate: string;
}

export interface Cheque {
  chequeId: string;
  chequeNumber: string;
  bankName: string;
  chequeDate: string;
  amount: number;
  contractReference: string;
  shopCode: string;
  status: 'Submitted' | 'Pending Deposit' | 'Deposited' | 'Cleared' | 'Bounced' | 'Replacement Required' | 'Cancelled';
  remarks?: string;
  submittedDate: string;
}

export interface UtilityBill {
  billId: string;
  billNumber: string;
  shopCode: string;
  stationName: string;
  billingPeriod: string;
  utilityType: 'Electricity' | 'Water' | 'Cooling' | 'Common Area Maintenance' | 'Other Charges';
  previousReading: number;
  currentReading: number;
  consumption: number;
  amount: number;
  dueDate: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  issueDate: string;
}

export interface Payment {
  paymentId: string;
  paymentDate: string;
  amountPaid: number;
  paymentMode: 'Cheque' | 'Bank Transfer' | 'Cash' | 'Online Payment';
  chequeNumber?: string;
  bankReference?: string;
  invoiceAdjusted: string;
  receiptNumber: string;
  paymentStatus: 'Completed' | 'Pending' | 'Failed';
}

export interface TenantDocument {
  documentId: string;
  documentName: string;
  documentType: 'Commercial Registration' | 'Trade License' | 'Computer Card' | 'QID Copy' |
                'Insurance Certificate' | 'Municipality License' | 'Civil Defense Approval' |
                'Food Safety Approval' | 'Signed Lease Agreement' | 'Security Deposit Proof' |
                'Cheque Copies' | 'Authorization Letters' | 'Other';
  relatedShop?: string;
  expiryDate?: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Expired' | 'Renewal Required';
  uploadedDate: string;
  rejectionReason?: string;
  fileUrl?: string;
}

export interface TenantRequest {
  requestId: string;
  requestNumber: string;
  requestType: 'Contract Renewal' | 'Contract Termination' | 'Shop Maintenance' |
                'Utility Bill Dispute' | 'Payment Clarification' | 'Document Update' |
                'Shop Access Request' | 'Signage Approval' | 'Complaint' | 'General Inquiry';
  relatedShop?: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  submittedDate: string;
  status: 'Submitted' | 'Under Review' | 'In Progress' | 'Pending Tenant Action' |
          'Pending WOQOD Approval' | 'Completed' | 'Rejected' | 'Closed';
  lastUpdated: string;
  assignedDepartment?: string;
  attachments?: string[];
  responseNotes?: string;
}

export interface TenantNotification {
  notificationId: string;
  title: string;
  message: string;
  type: 'Rent Payment Due' | 'Cheque Due Soon' | 'Cheque Bounced' | 'Utility Bill Generated' |
        'Contract Expiring' | 'Document Expiring' | 'Request Updated' | 'WOQOD Announcement' |
        'Maintenance Scheduled' | 'General';
  relatedEntity?: {
    type: 'shop' | 'contract' | 'invoice' | 'cheque' | 'request' | 'document';
    id: string;
  };
  createdDate: string;
  isRead: boolean;
  priority: 'Low' | 'Medium' | 'High';
}

export interface Announcement {
  announcementId: string;
  title: string;
  description: string;
  publishedDate: string;
  category: 'General' | 'Station Specific' | 'Payment' | 'Contract' | 'Maintenance' | 'Policy Update' | 'Safety Instruction';
  priority: 'Low' | 'Medium' | 'High';
  attachmentUrl?: string;
  targetAudience?: string;
}

export interface ReportConfig {
  reportId: string;
  reportName: string;
  reportType: 'Statement of Account' | 'Rent Payment Report' | 'Outstanding Balance Report' |
              'Utility Bill Report' | 'Cheque Status Report' | 'Shop List Report' |
              'Contract Summary Report' | 'Document Expiry Report' | 'Request History Report';
  description: string;
  availableFilters: string[];
}

export interface DashboardSummary {
  totalShops: number;
  activeContracts: number;
  expiringContracts: number;
  outstandingRent: number;
  utilityBillsDue: number;
  upcomingCheques: number;
  pendingRequests: number;
  unreadNotifications: number;
}

export interface ContractAlert {
  contractId: string;
  contractNumber: string;
  shopName: string;
  alertType: 'Expiring Soon' | 'Expired' | 'Renewal Due';
  expiryDate: string;
  daysRemaining: number;
  severity: 'Low' | 'Medium' | 'High';
}

export interface InvoiceFilter {
  shopCode?: string;
  contractReference?: string;
  month?: number;
  year?: number;
  status?: string;
}

export interface RequestSubmissionInput {
  requestType: string;
  relatedShop?: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  attachments?: File[];
}

// Sales Data Management Models

export type SalesDataStatus =
  | 'Received'
  | 'Under Processing'
  | 'Processed Successfully'
  | 'Validation Failed'
  | 'Pending Tenant Confirmation'
  | 'Confirmed by Tenant'
  | 'Disputed by Tenant'
  | 'Rejected';

export type SalesDataSource = 'API Integration' | 'File Upload' | 'Manual Entry';

export interface PaymentMethodBreakdown {
  cash: number;
  card: number;
  digitalWallet: number;
  other: number;
}

export interface SalesData {
  salesId: string;
  tenantId: string;
  tenantName: string;
  shopCode: string;
  shopName: string;
  stationCode: string;
  stationName: string;
  salesDate: string;
  salesPeriod: string; // e.g., "Daily", "Weekly", "Monthly"
  totalSalesAmount: number;
  transactionCount: number;
  paymentMethodBreakdown: PaymentMethodBreakdown;
  dataSource: SalesDataSource;
  uploadedDate: string;
  processedDate?: string;
  processingStatus: SalesDataStatus;
  validationStatus: 'Valid' | 'Invalid' | 'Pending Validation';
  validationErrors?: string[];
  remarks?: string;
  fileName?: string; // For file-based uploads
  confirmedByTenant?: boolean;
  confirmedDate?: string;
  disputedReason?: string;
}

export interface SalesDataSummary {
  totalSalesThisMonth: number;
  totalSalesLastMonth: number;
  totalTransactionsThisMonth: number;
  averageDailySales: number;
  pendingConfirmations: number;
  validationFailures: number;
  lastUploadDate: string;
  dataSubmissionMethod: SalesDataSource;
}

export interface SalesUploadHistory {
  uploadId: string;
  fileName: string;
  uploadDate: string;
  fileSize: number;
  recordsCount: number;
  status: SalesDataStatus;
  processedRecords: number;
  failedRecords: number;
  errorLog?: string;
}

export interface SalesReport {
  reportId: string;
  reportType: 'Daily Sales' | 'Monthly Sales' | 'Annual Sales' | 'Payment Method Analysis' | 'Sales Trend' | 'Comparative Sales';
  reportName: string;
  description: string;
  periodCovered: string;
  generatedDate: string;
  totalSales: number;
  totalTransactions: number;
  averageTransactionValue: number;
}

export interface SalesDispute {
  disputeId: string;
  salesId: string;
  salesDate: string;
  reportedAmount: number;
  tenantClaimedAmount: number;
  variance: number;
  reason: string;
  submittedDate: string;
  status: 'Submitted' | 'Under Review' | 'Resolved' | 'Rejected';
  resolution?: string;
  resolvedDate?: string;
}
