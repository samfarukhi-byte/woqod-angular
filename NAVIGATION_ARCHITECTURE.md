# WOQOD Total Control Portal - Navigation Architecture

## Overview

The portal follows a **service-oriented architecture** where **Kenar is one of many services** under WOQOD, and **Portal Management features are shared across all services** to maintain consistency.

---

## Navigation Structure

### 1. **Insights** (Common for All)
Top-level information accessible to all customers:
- **Home** (`/csp/home`) - Landing page
- **News & Updates** (`/csp/news`) - WOQOD news
- **Tenders** (`/csp/tenders`) - Active tenders

---

### 2. **View All Services** (Service Selector)
Collapsible menu showing all WOQOD business streams. Each service has its own dashboard and service-specific operations:

#### Service List:
1. **⛽ Retail** → `/csp/services/retail/dashboard`
2. **🚛 Bulk Fuel** → `/csp/services/bulk-fuel/dashboard`
3. **✈️ Aviation** → `/csp/services/aviation/dashboard`
4. **🚢 Bunkering** → `/csp/services/bunkering/dashboard`
5. **🛣️ Bitumen** → `/csp/services/bitumen/dashboard`
6. **🔍 Fahes** → `/csp/services/fahes/dashboard`
7. **⚡ Bulk Gas** → `/csp/services/bulk-gas/dashboard`
8. **💳 SHAFAF** → `/csp/services/shafaf/dashboard`
9. **🏪 Kenar (Rental Shops)** *(Nested submenu)*

#### Kenar Service Submenu:
When clicked, Kenar expands to show tenant-specific operational pages:
- **Dashboard** → `/kenar/dashboard`
  - Summary cards (shops, contracts, rent, bills, etc.)
  - Contract expiry alerts
  - Recent invoices, cheques, requests
  
- **My Profile** → `/kenar/profile`
  - Tenant company information
  - Contact details, account status
  - Linked shops summary
  
- **My Shops** → `/kenar/shops`
  - Rental shop listings
  - Shop details (location, type, rent, status)
  - Operational status
  
- **Contracts** → `/kenar/contracts`
  - Lease contracts management
  - Contract terms, renewal, termination
  - Expiry tracking
  
- **Rent & Invoices** → `/kenar/invoices`
  - Monthly rent invoices
  - Payment status, outstanding amounts
  - Invoice downloads
  
- **Cheque Status** → `/kenar/cheques`
  - Cheque tracking and management
  - Bounced cheque alerts
  - Replacement requests
  
- **Utility Bills** → `/kenar/utilities`
  - Electricity, water, cooling bills
  - Consumption tracking
  - Bill disputes
  
- **Payments & Receipts** → `/kenar/payments`
  - Payment history
  - Receipt downloads
  - Payment modes
  
- **Documents** → `/kenar/documents`
  - Document management (CR, licenses, permits)
  - Upload, renewal tracking
  - Expiry alerts
  
- **Reports** → `/kenar/reports`
  - Statement of account
  - Rent, utility, cheque reports
  - Document expiry reports

---

### 3. **Portal Management** (Common for All Services)

These features are **shared across ALL customers and ALL services** - whether you're a fuel customer, tenant, or using any WOQOD service:

#### **Submit and Track Request** (`/csp/track-requests`)
- **Purpose**: Unified request management for ALL service types
- **Common Request Types**: 
  - Profile update requests
  - Service inquiries
  - Billing disputes
  - Document updates
  - General complaints
- **Kenar-Specific Request Types** (same interface):
  - Contract renewal
  - Contract termination
  - Shop maintenance
  - Utility bill disputes
  - Payment clarification
  - Shop access requests
  - Signage approval
- **Features**:
  - Request submission form
  - Request tracking
  - Status updates
  - Response history
  - Attachment support

#### **Notifications** (`/csp/notifications`)
- **Purpose**: Centralized notification system for ALL services
- **Common Notifications**:
  - Account updates
  - System announcements
  - Service updates
- **Kenar-Specific Notifications** (same interface):
  - Rent payment due
  - Cheque due soon
  - Cheque bounced
  - Utility bill generated
  - Contract expiring
  - Document expiring
  - Request status updates
  - Maintenance scheduled
- **Features**:
  - Unread notification badges
  - Mark as read functionality
  - Notification filtering
  - Priority indicators

#### **Announcements** (`/kenar/announcements`)
- **Purpose**: WOQOD official announcements and updates
- **Content**:
  - General WOQOD news
  - Policy updates
  - Service changes
  - Maintenance schedules
  - Safety instructions
  - Payment system updates
- **Features**:
  - Category filtering
  - Priority sorting
  - Attachment downloads
  - Date sorting

#### **Settings** (Collapsible submenu)
Shared configuration for all customers:

- **🏢 Company Profile** (`/csp/settings/company-profile`)
  - Company information
  - Contact details
  - Address management
  
- **👥 User & Access** (`/csp/settings/user-access`)
  - User management
  - Role assignments
  - Access control
  
- **🔌 API Integration** (`/csp/settings/api-integration`)
  - API credentials
  - Integration settings
  - Webhook configuration
  
- **🔒 Security & Compliance** (`/csp/settings/security`)
  - Password policies
  - Login history
  - Security settings
  - Compliance documents
  
- **⚙️ System Preferences** (`/csp/settings/system`)
  - Language preferences
  - Notification settings
  - Display preferences
  - Theme customization

---

## Design Consistency Principles

### 1. **Navigation Hierarchy**
```
WOQOD Total Control Portal
│
├─ Insights (Common Info)
│  ├─ Home
│  ├─ News & Updates
│  └─ Tenders
│
├─ View All Services (Service Selector)
│  ├─ Retail → Dashboard
│  ├─ Bulk Fuel → Dashboard
│  ├─ Aviation → Dashboard
│  ├─ Bunkering → Dashboard
│  ├─ Bitumen → Dashboard
│  ├─ Fahes → Dashboard
│  ├─ Bulk Gas → Dashboard
│  ├─ SHAFAF → Dashboard
│  └─ Kenar (Rental Shops) ▼
│     ├─ Dashboard
│     ├─ My Profile
│     ├─ My Shops
│     ├─ Contracts
│     ├─ Rent & Invoices
│     ├─ Cheque Status
│     ├─ Utility Bills
│     ├─ Payments & Receipts
│     ├─ Documents
│     └─ Reports
│
└─ Portal Management (Common for All)
   ├─ Submit and Track Request
   ├─ Notifications
   ├─ Announcements
   └─ Settings ▼
      ├─ Company Profile
      ├─ User & Access
      ├─ API Integration
      ├─ Security & Compliance
      └─ System Preferences
```

### 2. **Separation of Concerns**

| Category | Purpose | Scope |
|----------|---------|-------|
| **Insights** | Information & Communication | All Customers |
| **View All Services** | Service-Specific Operations | Per Service |
| **Portal Management** | Account & System Management | All Customers |

### 3. **Why This Structure?**

#### **Service-Oriented Approach**
- Each WOQOD service (Retail, Aviation, Kenar, etc.) is a **business stream**
- Customers may use **multiple services**
- Navigation should allow easy **switching between services**
- Each service has its own **operational dashboard and features**

#### **Common Features Reduce Duplication**
- **One request system** for all services
- **One notification center** for all alerts
- **One settings area** for all configurations
- Reduces user confusion
- Easier to maintain
- Consistent user experience

#### **Scalability**
- Adding a new service (e.g., "Marine Fuel") only requires:
  1. Add to "View All Services" menu
  2. Create service-specific operational pages
  3. No need to duplicate Portal Management features
  
---

## User Experience Flow

### Example: Tenant User Journey

1. **Login** → Lands on `/csp/home`

2. **Access Kenar Service**:
   - Click "View All Services"
   - Click "🏪 Kenar (Rental Shops)"
   - Submenu expands showing Kenar-specific pages
   - Click "Dashboard" → `/kenar/dashboard`

3. **View Shop Details**:
   - From Dashboard or click "My Shops"
   - Browse shop listings → `/kenar/shops`
   - Click shop row → View details in modal

4. **Check Rent Invoice**:
   - Click "Rent & Invoices" → `/kenar/invoices`
   - Filter by month/shop
   - Download invoice PDF

5. **Submit Maintenance Request**:
   - Navigate to "Portal Management" section
   - Click "Submit and Track Request"
   - Select request type: "Shop Maintenance"
   - Fill form and submit
   - Same interface used by ALL WOQOD customers

6. **Check Notifications**:
   - Click "Notifications" in Portal Management
   - See all alerts (rent due, contract expiring, request updates)
   - Same notification center used by ALL services

7. **Update Company Profile**:
   - Click "Settings" → "Company Profile"
   - Update contact details
   - Same settings used by ALL customers

---

## Benefits of This Architecture

### ✅ **Consistency**
- Same look and feel across all services
- Common features work the same way everywhere
- Reduces learning curve

### ✅ **Efficiency**
- No duplicate code for requests, notifications, settings
- Single source of truth for common features
- Easier to maintain and update

### ✅ **Scalability**
- Easy to add new services
- New services inherit common features automatically
- Can focus on service-specific operations

### ✅ **User-Friendly**
- Clear separation between service operations and account management
- Intuitive navigation structure
- Users can manage multiple services from one portal

### ✅ **Maintainability**
- Changes to Portal Management apply to all services
- Service-specific changes don't affect common features
- Clear boundaries between modules

---

## Implementation Details

### Route Structure
```typescript
// Common routes (CSP Module)
/csp/home
/csp/news
/csp/tenders
/csp/track-requests          // Common for all
/csp/notifications           // Common for all
/csp/settings/*              // Common for all

// Service routes (Service Modules)
/csp/services/retail/dashboard
/csp/services/bulk-fuel/dashboard
// ... other services

// Kenar service routes (Kenar Module)
/kenar/dashboard
/kenar/profile
/kenar/shops
/kenar/contracts
/kenar/invoices
/kenar/cheques
/kenar/utilities
/kenar/payments
/kenar/documents
/kenar/reports
/kenar/announcements         // Service-specific announcements
```

### Module Organization
```
src/app/modules/
├── csp/                     # Common features + service dashboards
│   ├── pages/
│   │   ├── home/
│   │   ├── news/
│   │   ├── tenders/
│   │   ├── track-requests/  # Common for all
│   │   ├── notifications/   # Common for all
│   │   ├── settings/        # Common for all
│   │   └── service-dashboards/
│   │       ├── retail-dashboard/
│   │       ├── bulk-fuel-dashboard/
│   │       └── ...
│   └── csp.module.ts
│
└── kenar/                   # Kenar-specific operations
    ├── pages/
    │   ├── dashboard/
    │   ├── profile/
    │   ├── shops/
    │   ├── contracts/
    │   ├── invoices/
    │   ├── cheques/
    │   ├── utilities/
    │   ├── payments/
    │   ├── documents/
    │   ├── reports/
    │   └── announcements/   # Kenar-specific content
    └── kenar.module.ts
```

### State Management
```typescript
// Common state (CspService)
- User session
- Common requests
- Common notifications
- Settings
- Company profile

// Kenar state (KenarService)
- Tenant profile
- Shops
- Contracts
- Invoices
- Cheques
- Utility bills
- Payments
- Documents
- Kenar-specific announcements
```

---

## Future Considerations

### When Adding a New Service

1. **Create service module** (e.g., `MarineModule`)
2. **Add service dashboard** to CSP module service-dashboards
3. **Add to navigation** under "View All Services"
4. **Service-specific pages** go in the new module
5. **Common features** (requests, notifications, settings) are already available

### Integration Points

- **Requests**: Service-specific request types can be added to the common request system
- **Notifications**: Service-specific notification types can be added to the common notification center
- **Settings**: Service-specific settings can be added as new tabs/sections in settings
- **Reports**: Service-specific reports go in the service module

---

## Summary

The WOQOD Total Control Portal now follows a **consistent, scalable architecture** where:

1. **Kenar is properly positioned** as one service among many
2. **Portal Management is shared** across all services
3. **Service-specific operations** are contained within their respective modules
4. **Navigation is intuitive** and consistent
5. **Maintenance is simplified** through code reuse
6. **Future growth is supported** through modular design

This structure ensures **design consistency**, **reduces duplication**, and provides a **unified user experience** across all WOQOD services.

---

**Last Updated**: May 23, 2026  
**Architecture Status**: ✅ Implemented and Verified
