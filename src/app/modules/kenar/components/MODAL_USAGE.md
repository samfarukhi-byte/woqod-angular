# Kenar Modal Components Usage Guide

This document explains how to use the four modal components in the Kenar module.

## 1. ShopDetailModalComponent

Displays detailed information about a shop.

### Usage Example

```typescript
// In your component TypeScript
export class ShopsComponent {
  showShopModal = false;
  selectedShopId: string | null = null;

  openShopDetails(shopId: string): void {
    this.selectedShopId = shopId;
    this.showShopModal = true;
  }

  closeShopModal(): void {
    this.showShopModal = false;
    this.selectedShopId = null;
  }
}
```

```html
<!-- In your component HTML -->
<button (click)="openShopDetails('SHP-001')">View Shop Details</button>

<app-shop-detail-modal
  [shopId]="selectedShopId"
  [open]="showShopModal"
  (closed)="closeShopModal()"
></app-shop-detail-modal>
```

### Inputs
- `shopId: string | null` - The ID of the shop to display
- `open: boolean` - Whether the modal is open

### Outputs
- `closed: EventEmitter<void>` - Emitted when the modal is closed

---

## 2. ContractDetailModalComponent

Displays full contract details with financial terms and key contract information.

### Usage Example

```typescript
// In your component TypeScript
import { Contract } from '../../../../models/kenar.model';

export class ContractsComponent {
  showContractModal = false;
  selectedContract: Contract | null = null;

  openContractDetails(contract: Contract): void {
    this.selectedContract = contract;
    this.showContractModal = true;
  }

  closeContractModal(): void {
    this.showContractModal = false;
    this.selectedContract = null;
  }
}
```

```html
<!-- In your component HTML -->
<button (click)="openContractDetails(contract)">View Contract</button>

<app-contract-detail-modal
  [contract]="selectedContract"
  [open]="showContractModal"
  (closed)="closeContractModal()"
></app-contract-detail-modal>
```

### Inputs
- `contract: Contract | null` - The contract object to display
- `open: boolean` - Whether the modal is open

### Outputs
- `closed: EventEmitter<void>` - Emitted when the modal is closed

---

## 3. SubmitRequestModalComponent

A form modal for submitting new requests (maintenance, contract renewal, complaints, etc.).

### Usage Example

```typescript
// In your component TypeScript
export class RequestsComponent {
  showSubmitModal = false;

  openSubmitRequestModal(): void {
    this.showSubmitModal = true;
  }

  closeSubmitModal(): void {
    this.showSubmitModal = false;
  }

  onRequestSubmitted(): void {
    // Refresh your requests list
    console.log('Request submitted successfully');
    // Optional: reload requests from service
  }
}
```

```html
<!-- In your component HTML -->
<button (click)="openSubmitRequestModal()">Submit New Request</button>

<app-submit-request-modal
  [open]="showSubmitModal"
  (closed)="closeSubmitModal()"
  (submitted)="onRequestSubmitted()"
></app-submit-request-modal>
```

### Inputs
- `open: boolean` - Whether the modal is open

### Outputs
- `closed: EventEmitter<void>` - Emitted when the modal is closed
- `submitted: EventEmitter<void>` - Emitted when a request is successfully submitted

### Form Fields
- **Request Type** (required) - Dropdown with predefined types
- **Related Shop** (optional) - Dropdown of tenant's shops
- **Subject** (required) - Text input, min 3 characters
- **Description** (required) - Textarea, min 10 characters
- **Priority** (required) - Dropdown (Low, Medium, High, Urgent)

---

## 4. UploadDocumentModalComponent

A form modal for uploading documents with metadata.

### Usage Example

```typescript
// In your component TypeScript
export class DocumentsComponent {
  showUploadModal = false;

  openUploadModal(): void {
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
  }

  onDocumentUploaded(): void {
    // Refresh your documents list
    console.log('Document uploaded successfully');
    // Optional: reload documents from service
  }
}
```

```html
<!-- In your component HTML -->
<button (click)="openUploadModal()">Upload Document</button>

<app-upload-document-modal
  [open]="showUploadModal"
  (closed)="closeUploadModal()"
  (uploaded)="onDocumentUploaded()"
></app-upload-document-modal>
```

### Inputs
- `open: boolean` - Whether the modal is open

### Outputs
- `closed: EventEmitter<void>` - Emitted when the modal is closed
- `uploaded: EventEmitter<void>` - Emitted when a document is successfully uploaded

### Form Fields
- **Document Type** (required) - Dropdown with predefined document types
- **Document Name** (required) - Text input, min 3 characters
- **Related Shop** (optional) - Dropdown of tenant's shops
- **Expiry Date** (optional) - Date picker
- **File Upload** (required) - File input (accepts PDF, JPG, PNG)

---

## Styling

All modals use the global WOQOD design system CSS classes from `woqod-styles.css`:

### Modal Structure
- `.csp-modal-backdrop` - Semi-transparent overlay
- `.csp-modal` - Modal container
- `.csp-modal__head` - Modal header
- `.csp-modal__title` - Modal title
- `.csp-modal__sub` - Modal subtitle
- `.csp-modal__body` - Modal body content
- `.csp-modal__footer` - Modal footer with action buttons

### Form Styles
- `.csp-form-group` - Form field wrapper
- `.csp-form-group--invalid` - Applied when field has errors
- `.csp-form-group__label` - Field label
- `.csp-form-group__label-required` - Required field indicator (*)
- `.csp-form-group__input` - Text input
- `.csp-form-group__select` - Select dropdown
- `.csp-form-group__textarea` - Textarea
- `.csp-form-group__error` - Error message
- `.csp-form-group__hint` - Helper text

### Button Styles
- `.csp-btn` - Base button
- `.csp-btn--primary` - Primary action button (green)
- `.csp-btn--secondary` - Secondary action button (gray)
- `.csp-btn-icon` - Icon-only button (close X)

### Badge Styles
- `.csp-badge--approved` - Green badge (Active, Operational, Cleared)
- `.csp-badge--pending` - Yellow badge (Pending, Under Review)
- `.csp-badge--rejected` - Red badge (Rejected, Expired, Bounced)
- `.csp-badge--info` - Blue badge (general information)

---

## Notes

- All modals have backdrop click-to-close functionality
- Form modals include proper validation with error messages
- Submit buttons are disabled while submitting or when form is invalid
- File upload is currently a placeholder (stores metadata only, no actual file upload to server)
- All modals use reactive forms with proper TypeScript typing
- Data is saved to localStorage via KenarService methods
- Forms reset when modal is closed or opened again
