import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CspService } from '../../../../../core/services/csp.service';
import { Customer, Address, PrimaryContact } from '../../../../../models/customer.model';
import { CompanyDocument } from '../../../../../models/settings.model';

interface SecondaryContact {
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  phoneExtension: string;
}

@Component({
  selector: 'app-company-profile-settings',
  templateUrl: './company-profile-settings.component.html',
  styleUrls: ['./company-profile-settings.component.scss'],
})
export class CompanyProfileSettingsComponent implements OnInit {
  customer!: Customer;
  documents: CompanyDocument[] = [];
  selectedDocument: CompanyDocument | null = null;
  showPdfViewer = false;

  // Edit mode
  isEditMode = false;
  companyForm!: FormGroup;
  primaryContactForm!: FormGroup;
  secondaryContactForm!: FormGroup;
  addressForm!: FormGroup;

  // Document upload
  showUploadSection = false;
  uploadedFiles: File[] = [];
  dragOver = false;

  // Modals
  showAlertModal = false;
  alertMessage = '';
  alertTitle = 'Information';
  showConfirmDelete = false;
  documentToDelete: CompanyDocument | null = null;

  // Secondary contact (mock data)
  secondaryContact: SecondaryContact = {
    prefix: 'Ms.',
    firstName: 'Fatima',
    middleName: 'Ali',
    lastName: 'Al-Thani',
    jobTitle: 'Operations Manager',
    email: 'fatima.althani@hadad-medical.com',
    phone: '+974-4413-9998',
    phoneExtension: '102',
  };

  constructor(
    private readonly csp: CspService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.customer = this.csp.getCustomer();
    this.documents = this.csp.getCompanyDocuments();
    this.initializeForms();
  }

  initializeForms(): void {
    this.companyForm = this.fb.group({
      customerName: [this.customer.customerName, Validators.required],
      customerCode: [this.customer.customerCode],
      registryId: [this.customer.registryId, Validators.required],
      businessClassification: [this.customer.businessClassification],
      businessSubClassification: [this.customer.businessSubClassification],
      accountDescription: [this.customer.accountDescription],
    });

    this.primaryContactForm = this.fb.group({
      prefix: [this.customer.primaryContact.prefix],
      firstName: [this.customer.primaryContact.firstName, Validators.required],
      middleName: [this.customer.primaryContact.middleName],
      lastName: [this.customer.primaryContact.lastName, Validators.required],
      jobTitle: [this.customer.primaryContact.jobTitle],
      email: [this.customer.primaryContact.email, [Validators.required, Validators.email]],
      phone: [this.customer.primaryContact.phone, Validators.required],
      phoneExtension: [this.customer.primaryContact.phoneExtension],
    });

    this.secondaryContactForm = this.fb.group({
      prefix: [this.secondaryContact.prefix],
      firstName: [this.secondaryContact.firstName, Validators.required],
      middleName: [this.secondaryContact.middleName],
      lastName: [this.secondaryContact.lastName, Validators.required],
      jobTitle: [this.secondaryContact.jobTitle],
      email: [this.secondaryContact.email, [Validators.required, Validators.email]],
      phone: [this.secondaryContact.phone, Validators.required],
      phoneExtension: [this.secondaryContact.phoneExtension],
    });

    this.addressForm = this.fb.group({
      country: [this.customer.registeredAddress.country, Validators.required],
      address1: [this.customer.registeredAddress.address1, Validators.required],
      address2: [this.customer.registeredAddress.address2],
      city: [this.customer.registeredAddress.city, Validators.required],
      state: [this.customer.registeredAddress.state],
      postalCode: [this.customer.registeredAddress.postalCode, Validators.required],
    });
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      this.cancelEdit();
    } else {
      this.isEditMode = true;
    }
  }

  saveChanges(): void {
    if (this.companyForm.valid && this.primaryContactForm.valid && this.secondaryContactForm.valid && this.addressForm.valid) {
      // Update customer object
      Object.assign(this.customer, this.companyForm.value);
      Object.assign(this.customer.primaryContact, this.primaryContactForm.value);
      Object.assign(this.customer.registeredAddress, this.addressForm.value);
      Object.assign(this.secondaryContact, this.secondaryContactForm.value);

      this.isEditMode = false;
      this.alertTitle = '✓ Success';
      this.alertMessage = 'Company profile updated successfully!';
      this.showAlertModal = true;
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.initializeForms();
  }

  fullContactName(contact: any): string {
    return [contact.prefix, contact.firstName, contact.middleName, contact.lastName].filter(Boolean).join(' ') || '—';
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  getDaysUntilExpiry(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getExpiryStatus(doc: CompanyDocument): 'expired' | 'expiring-soon' | 'valid' | 'no-expiry' {
    if (!doc.expiryDate) return 'no-expiry';
    const days = this.getDaysUntilExpiry(doc.expiryDate);
    if (days < 0) return 'expired';
    if (days <= 30) return 'expiring-soon';
    return 'valid';
  }

  getExpiryBadgeClass(doc: CompanyDocument): string {
    const status = this.getExpiryStatus(doc);
    if (status === 'expired') return 'csp-badge--rejected';
    if (status === 'expiring-soon') return 'csp-badge--pending';
    if (status === 'valid') return 'csp-badge--approved';
    return 'csp-badge--info';
  }

  getExpiryText(doc: CompanyDocument): string {
    if (!doc.expiryDate) return 'No Expiry';
    const days = this.getDaysUntilExpiry(doc.expiryDate);
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires Today';
    if (days <= 30) return `Expires in ${days} days`;
    return `Valid until ${this.formatDate(doc.expiryDate)}`;
  }

  downloadDocument(doc: CompanyDocument): void {
    // Simulate download
    this.alertTitle = 'ℹ️ Information';
    this.alertMessage = `Downloading: ${doc.fileName}`;
    this.showAlertModal = true;
    // In production: window.open(doc.fileUrl, '_blank');
  }

  renewDocument(doc: CompanyDocument): void {
    this.alertTitle = 'ℹ️ Information';
    this.alertMessage = `Renew document: ${doc.title}`;
    this.showAlertModal = true;
    // Navigate to document renewal flow
  }

  deleteDocument(doc: CompanyDocument): void {
    console.log('Delete clicked for:', doc.title);
    this.documentToDelete = doc;
    this.showConfirmDelete = true;
    console.log('showConfirmDelete set to:', this.showConfirmDelete);
  }

  confirmDeleteDocument(): void {
    if (this.documentToDelete) {
      // Filter out the document
      this.documents = this.documents.filter(d => d.docId !== this.documentToDelete!.docId);

      // Persist to service (save to localStorage)
      this.csp.saveCompanyDocuments(this.documents);

      this.showConfirmDelete = false;
      this.alertTitle = '✓ Success';
      this.alertMessage = `Document "${this.documentToDelete.title}" deleted successfully!`;
      this.showAlertModal = true;
      this.documentToDelete = null;
    }
  }

  cancelDeleteDocument(): void {
    this.showConfirmDelete = false;
    this.documentToDelete = null;
  }

  openPdfViewer(doc: CompanyDocument): void {
    this.selectedDocument = doc;
    this.showPdfViewer = true;
  }

  closePdfViewer(): void {
    this.showPdfViewer = false;
    this.selectedDocument = null;
  }

  toggleUploadSection(): void {
    this.showUploadSection = !this.showUploadSection;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  handleFiles(files: File[]): void {
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    this.uploadedFiles = [...this.uploadedFiles, ...pdfFiles];
  }

  removeUploadedFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  submitDocuments(): void {
    if (this.uploadedFiles.length === 0) {
      this.alertTitle = '⚠️ Alert';
      this.alertMessage = 'Please upload at least one document';
      this.showAlertModal = true;
      return;
    }

    // Simulate upload
    this.uploadedFiles.forEach((file, index) => {
      const newDoc: CompanyDocument = {
        docId: 'DOC-NEW-' + Date.now() + index,
        title: file.name.replace('.pdf', ''),
        fileName: file.name,
        fileSize: file.size,
        uploadedDate: new Date().toISOString().split('T')[0],
        category: 'Legal',
        description: 'Newly uploaded document',
        expiryDate: undefined,
        status: 'Active',
      };
      this.documents.push(newDoc);
    });

    // Persist to service
    this.csp.saveCompanyDocuments(this.documents);

    this.alertTitle = '✓ Success';
    this.alertMessage = `${this.uploadedFiles.length} document(s) uploaded successfully!`;
    this.showAlertModal = true;
    this.uploadedFiles = [];
    this.showUploadSection = false;
  }

  closeAlertModal(): void {
    this.showAlertModal = false;
    this.alertMessage = '';
    this.alertTitle = 'Information';
  }
}
