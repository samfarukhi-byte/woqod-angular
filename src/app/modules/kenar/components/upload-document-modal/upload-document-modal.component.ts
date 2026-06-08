import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KenarService } from '../../../../core/services/kenar.service';
import { Shop } from '../../../../models/kenar.model';

const DOCUMENT_TYPES = [
  'Commercial Registration',
  'Trade License',
  'Computer Card',
  'QID Copy',
  'Insurance Certificate',
  'Municipality License',
  'Civil Defense Approval',
  'Food Safety Approval',
  'Signed Lease Agreement',
  'Security Deposit Proof',
  'Cheque Copies',
  'Authorization Letters',
  'Other',
];

@Component({
  selector: 'app-upload-document-modal',
  templateUrl: './upload-document-modal.component.html',
  styleUrls: ['./upload-document-modal.component.scss'],
})
export class UploadDocumentModalComponent implements OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() uploaded = new EventEmitter<void>();

  documentForm: FormGroup;
  isUploading = false;
  shops: Shop[] = [];
  documentTypes = DOCUMENT_TYPES;
  selectedFileName = '';

  constructor(
    private fb: FormBuilder,
    private kenarService: KenarService
  ) {
    this.documentForm = this.fb.group({
      documentType: ['', Validators.required],
      documentName: ['', [Validators.required, Validators.minLength(3)]],
      relatedShop: [''],
      expiryDate: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.shops = this.kenarService.getShops();
      this.documentForm.reset();
      this.selectedFileName = '';
      this.isUploading = false;
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.documentForm.get(fieldName);
    if (!field || !field.touched || !field.errors) return null;

    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `Minimum ${requiredLength} characters required`;
    }
    return null;
  }

  hasError(fieldName: string): boolean {
    const field = this.documentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileName = input.files[0].name;
    }
  }

  onSubmit(): void {
    if (this.documentForm.invalid) {
      Object.keys(this.documentForm.controls).forEach(key => {
        this.documentForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.selectedFileName) {
      alert('Please select a file to upload');
      return;
    }

    this.isUploading = true;

    // Simulate file upload delay
    setTimeout(() => {
      const formValue = this.documentForm.value;
      this.kenarService.uploadDocument({
        documentType: formValue.documentType,
        documentName: formValue.documentName,
        relatedShop: formValue.relatedShop || undefined,
        expiryDate: formValue.expiryDate || undefined,
      });

      this.isUploading = false;
      this.uploaded.emit();
      this.closed.emit();
    }, 1000);
  }

  cancel(): void {
    this.documentForm.reset();
    this.selectedFileName = '';
    this.closed.emit();
  }
}
