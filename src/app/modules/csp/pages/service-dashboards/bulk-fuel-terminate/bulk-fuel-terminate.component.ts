import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BulkFuelContract, BulkFuelService } from '../../../../../core/services/bulk-fuel.service';

@Component({
  selector: 'app-bulk-fuel-terminate',
  templateUrl: './bulk-fuel-terminate.component.html',
  styleUrls: ['./bulk-fuel-terminate.component.scss'],
})
export class BulkFuelTerminateComponent implements OnInit {
  contracts: BulkFuelContract[] = [];
  selected: BulkFuelContract | null = null;
  form!: FormGroup;
  submitted = false;

  showSuccess = false;
  referenceNumber = '';
  barcodeBars: number[] = [];

  readonly reasons = [
    'Project completed', 'Contract no longer required', 'Switching supplier',
    'Business closure / relocation', 'Financial reasons', 'Other',
  ];

  constructor(private readonly fb: FormBuilder, private readonly router: Router, private readonly bf: BulkFuelService) {}

  ngOnInit(): void {
    this.contracts = this.bf.getActiveContracts();
    this.form = this.fb.group({
      reason: ['', Validators.required],
      effectiveDate: ['', Validators.required],
      remarks: [''],
      settleOutstanding: [false],
      declaration: [false, Validators.requiredTrue],
    });
  }

  select(c: BulkFuelContract): void { this.selected = c; }
  clearSelection(): void { this.selected = null; this.submitted = false; this.form.reset({ settleOutstanding: false, declaration: false }); }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || this.submitted);
  }

  submit(): void {
    this.submitted = true;
    if (!this.selected || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.referenceNumber = this.bf.saveApplication({
      type: 'Bulk Fuel — Termination',
      status: 'Submitted',
      data: { contractNo: this.selected.contractNo, ...this.form.getRawValue() },
    });
    this.barcodeBars = this.bf.makeBarcode(this.referenceNumber);
    this.showSuccess = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToBulkFuel(): void { this.router.navigate(['/csp/services/bulk-fuel/dashboard']); }
  goToTracking(): void { this.router.navigate(['/csp/track-requests']); }
}
