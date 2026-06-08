import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KenarService } from '../../../../core/services/kenar.service';
import { Shop } from '../../../../models/kenar.model';

const REQUEST_TYPES = [
  'Contract Renewal',
  'Contract Termination',
  'Shop Maintenance',
  'Utility Bill Dispute',
  'Payment Clarification',
  'Document Update',
  'Shop Access Request',
  'Signage Approval',
  'Complaint',
  'General Inquiry',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

@Component({
  selector: 'app-submit-request-modal',
  templateUrl: './submit-request-modal.component.html',
  styleUrls: ['./submit-request-modal.component.scss'],
})
export class SubmitRequestModalComponent implements OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  requestForm: FormGroup;
  isSubmitting = false;
  shops: Shop[] = [];
  requestTypes = REQUEST_TYPES;
  priorities = PRIORITIES;

  constructor(
    private fb: FormBuilder,
    private kenarService: KenarService
  ) {
    this.requestForm = this.fb.group({
      requestType: ['', Validators.required],
      relatedShop: [''],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['Medium', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.shops = this.kenarService.getShops();
      this.requestForm.reset({ priority: 'Medium' });
      this.isSubmitting = false;
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.requestForm.get(fieldName);
    if (!field || !field.touched || !field.errors) return null;

    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `Minimum ${requiredLength} characters required`;
    }
    return null;
  }

  hasError(fieldName: string): boolean {
    const field = this.requestForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  onSubmit(): void {
    if (this.requestForm.invalid) {
      Object.keys(this.requestForm.controls).forEach(key => {
        this.requestForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Simulate API call delay
    setTimeout(() => {
      const formValue = this.requestForm.value;
      this.kenarService.submitRequest({
        requestType: formValue.requestType,
        relatedShop: formValue.relatedShop || undefined,
        subject: formValue.subject,
        description: formValue.description,
        priority: formValue.priority,
      });

      this.isSubmitting = false;
      this.submitted.emit();
      this.closed.emit();
    }, 800);
  }

  cancel(): void {
    this.requestForm.reset({ priority: 'Medium' });
    this.closed.emit();
  }
}
