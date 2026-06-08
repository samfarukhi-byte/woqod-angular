import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CspService } from '../../../../core/services/csp.service';
import { Customer } from '../../../../models/customer.model';
import { ProfileChangeDraft } from '../../../../models/request.model';

const EDITABLE_FIELDS = [
  'firstName', 'lastName', 'email', 'phone', 'phoneExtension', 'jobTitle',
  'address1', 'city', 'postalCode', 'country',
] as const;

type EditableField = typeof EDITABLE_FIELDS[number];

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit, OnDestroy {
  customer!: Customer;
  form!: FormGroup;
  original: Record<EditableField, string> = {} as any;
  changedFields = new Set<EditableField>();
  showSuccess = false;
  showError = false;
  showValidationModal = false;
  validationErrors: string[] = [];
  showConfirmReset = false;
  errorMessage = '<strong>Please fix the errors above before submitting.</strong>';
  formStatus = 'No changes yet.';
  triedSubmit = false;
  countries = ['Qatar', 'Saudi Arabia', 'UAE', 'Bahrain', 'Kuwait', 'Oman'];
  customerTypes = ['Individual', 'Corporate', 'Partnership'];
  statusOptions = ['Active', 'Inactive', 'Suspended'];

  private valueSub: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly csp: CspService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.customer = this.csp.getCustomer();
    const c = this.customer.primaryContact;
    const a = this.customer.billingAddress;
    this.form = this.fb.group({
      firstName: [c.firstName, Validators.required],
      lastName: [c.lastName, Validators.required],
      email: [c.email, [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
      phone: [c.phone, [Validators.required, Validators.pattern(/^[+\d][\d\s().+\-]{6,}$/)]],
      phoneExtension: [c.phoneExtension ?? ''],
      jobTitle: [c.jobTitle ?? ''],
      address1: [a.address1, Validators.required],
      city: [a.city, Validators.required],
      postalCode: [a.postalCode, Validators.required],
      country: [a.country, Validators.required],
    });
    this.original = this.snapshot();
    this.refreshChangeFlags();
    this.valueSub = this.form.valueChanges.subscribe(() => this.refreshChangeFlags());
  }

  ngOnDestroy(): void {
    this.valueSub?.unsubscribe();
  }

  isInvalid(field: EditableField): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.triedSubmit);
  }

  isChanged(field: EditableField): boolean {
    return this.changedFields.has(field);
  }

  errorFor(field: EditableField): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required']) {
      switch (field) {
        case 'firstName': return 'First Name is required';
        case 'lastName': return 'Last Name is required';
        case 'email': return 'Email is required';
        case 'phone': return 'Phone is required';
        case 'address1': return 'Address Line 1 is required';
        case 'city': return 'City is required';
        case 'postalCode': return 'Postal Code is required';
        case 'country': return 'Country is required';
        default: return 'Required';
      }
    }
    if (ctrl.errors['pattern']) {
      if (field === 'email') return 'Please enter a valid email address';
      if (field === 'phone') return 'Please enter a valid phone number';
    }
    return 'Invalid value';
  }

  private snapshot(): Record<EditableField, string> {
    const v = this.form.value;
    const out = {} as Record<EditableField, string>;
    for (const k of EDITABLE_FIELDS) out[k] = String(v[k] ?? '').trim();
    return out;
  }

  private refreshChangeFlags(): void {
    if (!this.form) return;
    const cur = this.snapshot();
    this.changedFields.clear();
    for (const k of EDITABLE_FIELDS) {
      if ((cur[k] ?? '') !== (this.original[k] ?? '')) this.changedFields.add(k);
    }
    const n = this.changedFields.size;
    this.formStatus = n === 0 ? 'No changes yet.' : `${n} field${n === 1 ? '' : 's'} changed since loaded.`;
  }

  onSubmit(): void {
    this.triedSubmit = true;
    this.showSuccess = false;
    this.showError = false;
    this.showValidationModal = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      // Collect all validation errors
      this.validationErrors = [];
      for (const field of EDITABLE_FIELDS) {
        const ctrl = this.form.get(field);
        if (ctrl && ctrl.invalid) {
          const errorMsg = this.errorFor(field);
          if (errorMsg) {
            this.validationErrors.push(errorMsg);
          }
        }
      }

      // Show validation modal
      this.showValidationModal = true;
      return;
    }
    const cur = this.snapshot();
    const changedKeys = EDITABLE_FIELDS.filter((k) => (cur[k] ?? '') !== (this.original[k] ?? ''));
    if (changedKeys.length === 0) {
      this.showError = true;
      this.errorMessage = '<strong>No changes detected.</strong> Edit at least one field, or click Cancel.';
      return;
    }
    const draft: ProfileChangeDraft = {
      submittedAt: new Date().toISOString(),
      changedFields: changedKeys,
      oldValues: changedKeys.reduce((acc, k) => ({ ...acc, [k]: this.original[k] ?? '' }), {} as Record<string, string>),
      newValues: changedKeys.reduce((acc, k) => ({ ...acc, [k]: cur[k] ?? '' }), {} as Record<string, string>),
    };
    this.csp.saveProfileChanges(draft);
    this.showSuccess = true;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => this.router.navigate(['/csp/documents']), reduceMotion ? 0 : 1500);
  }

  onReset(): void {
    this.showConfirmReset = true;
  }

  confirmReset(): void {
    this.form.reset(this.original);
    this.refreshChangeFlags();
    this.showSuccess = false;
    this.showError = false;
    this.showValidationModal = false;
    this.showConfirmReset = false;
    this.triedSubmit = false;
  }

  cancelReset(): void {
    this.showConfirmReset = false;
  }

  closeValidationModal(): void {
    this.showValidationModal = false;
  }

  onCancel(): void {
    this.router.navigate(['/csp/profile']);
  }
}
