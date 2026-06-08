// User & Access Management
export type UserRole = 'Viewer' | 'Editor' | 'Maker' | 'Checker' | 'Super Admin';
export type LOB = 'Fuel' | 'APC' | 'Bulk Fuel';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface LOBAccess {
  lob: LOB;
  hasAccess: boolean;
}

export interface User {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  lobAssignments: LOBAccess[];
  status: UserStatus;
  lastLogin: string | null;
  createdDate: string;
  lastModified?: string;
}

export interface PermissionMatrix {
  role: UserRole;
  permissions: Record<LOB, string[]>;
}

// LOB Contact User
export interface LOBContactUser {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

// LOB Contact
export interface LOBContact {
  lob: LOB;
  department?: string;
  users: LOBContactUser[];
}

// Company Documents
export interface CompanyDocument {
  docId: string;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedDate: string;
  category: string;
  description?: string;
  fileUrl?: string;
  expiryDate?: string;
  status?: 'Active' | 'Expired' | 'Expiring Soon';
}

// Security & Compliance
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays: number;
  historyCount: number;
}

export interface SessionSettings {
  timeoutMinutes: 15 | 30 | 60;
  twoFactorEnabled: boolean;
}

export interface LoginHistoryEntry {
  timestamp: string;
  user: string;
  ipAddress: string;
  device: string;
  status: 'Success' | 'Failed';
  location?: string;
}

export interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}

// Notifications & Alerts
export type NotificationChannel = 'email' | 'sms' | 'push';
export type AlertType = 'fuel_prices' | 'station_downtime' | 'system_downtime' | 'announcements' | 'monthly_invoices' | 'payment_due' | 'request_status' | 'promotions' | 'account_activity';

export interface NotificationPreferences {
  channels: Record<NotificationChannel, boolean>;
  alertTypes: Record<AlertType, boolean>;
}

// Approval Flow Configuration
export type ApprovalFlowType = 'invoice' | 'purchase_order' | 'delivery' | 'credit_note';
export type ApprovalLevel = 1 | 2 | 3;

export interface ApprovalStep {
  stepId: string;
  level: ApprovalLevel;
  approverRole: UserRole;
  minAmount?: number;
  maxAmount?: number;
  isRequired: boolean;
}

export interface ApprovalFlowConfig {
  flowId: string;
  lob: LOB;
  flowType: ApprovalFlowType;
  enabled: boolean;
  steps: ApprovalStep[];
  autoSyncToERP: boolean;
  requireAllApprovals: boolean;
  description?: string;
}

// API Integration
export interface APIEndpoint {
  endpointId: string;
  name: string;
  category: 'Vehicles' | 'Consumption' | 'Billing' | 'Transactions' | 'Fleet';
  method: 'GET' | 'POST';
  path: string;
  description: string;
  requiresAuth: boolean;
  rateLimit?: string;
}

export interface APICredentials {
  apiKey: string;
  secretKey: string;
  createdAt: string;
  expiresAt?: string;
  lastUsed?: string;
  status: 'Active' | 'Expired' | 'Revoked';
}

export interface LOBAPIConfig {
  lob: LOB;
  enabled: boolean;
  credentials: APICredentials | null;
  availableEndpoints: APIEndpoint[];
  webhookUrl?: string;
}

// System Preferences
export type Language = 'en' | 'ar';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

export interface SystemPreferences {
  language: Language;
  dateFormat: DateFormat;
  defaultDashboardView: LOB | 'all';
}

// ── Configurations: customer-defined dynamic approval flows ──
// A customer admin defines what kind of request must pass through an internal
// approval chain before it is sent to WOQOD. After the final level approves,
// the result is (optionally) pushed to the Open API interface so the customer
// can retrieve it programmatically.
export type ConfigurationApprovalType =
  | 'invoice_verification'
  | 'document_edit'
  | 'document_update'
  | 'profile_change'
  | 'custom_request';

export interface ConfigurationApprover {
  levelId: string;
  level: number;        // 1-based order of approval
  title: string;        // role/title of this approval level, e.g. "Finance Manager"
  userId: string;       // assigned approver (from the customer's users)
  userName: string;
  userEmail: string;
}

export interface ConfigurationFlow {
  configId: string;
  name: string;
  approvalType: ConfigurationApprovalType;
  description?: string;
  enabled: boolean;
  approvers: ConfigurationApprover[];
  pushToOpenApi: boolean;     // push the approved result to the Open API interface
  apiEndpointPath?: string;   // endpoint the customer calls to retrieve approved data
  createdDate: string;
  lastModified?: string;
}

// Settings State
export interface SettingsState {
  notificationPreferences: NotificationPreferences;
  systemPreferences: SystemPreferences;
  lobContacts: LOBContact[];
  approvalFlows: ApprovalFlowConfig[];
  apiConfigs: LOBAPIConfig[];
}
