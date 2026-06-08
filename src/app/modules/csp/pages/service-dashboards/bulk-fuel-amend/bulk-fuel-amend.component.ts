import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BulkFuelContract, BulkFuelService } from '../../../../../core/services/bulk-fuel.service';

type AmendType = 'increase' | 'decrease' | 'shift';

@Component({
  selector: 'app-bulk-fuel-amend',
  templateUrl: './bulk-fuel-amend.component.html',
  styleUrls: ['./bulk-fuel-amend.component.scss'],
})
export class BulkFuelAmendComponent implements OnInit {
  contracts: BulkFuelContract[] = [];
  selected: BulkFuelContract | null = null;
  amendType: AmendType = 'increase';
  form!: FormGroup;
  submitted = false;

  showSuccess = false;
  referenceNumber = '';
  barcodeBars: number[] = [];

  constructor(private readonly fb: FormBuilder, private readonly router: Router, private readonly bf: BulkFuelService) {}

  ngOnInit(): void {
    this.contracts = this.bf.getActiveContracts();
    this.form = this.fb.group({
      newMinVolume: [''],
      newMaxVolume: [''],
      tankNo: [''],
      targetContractNo: [''],
      remarks: [''],
      declaration: [false, Validators.requiredTrue],
    });
  }

  /** Active contracts other than the selected one (shift targets). */
  get otherContracts(): BulkFuelContract[] {
    return this.contracts.filter((c) => c.contractNo !== this.selected?.contractNo);
  }

  get emptyTanks() { return this.selected?.tanks.filter((t) => t.status === 'Empty') ?? []; }

  select(c: BulkFuelContract): void {
    this.selected = c;
    this.amendType = 'increase';
    this.submitted = false;
    this.form.reset({ declaration: false });
    this.form.patchValue({ newMinVolume: c.minVolume, newMaxVolume: c.maxVolume });
  }

  setAmendType(t: AmendType): void {
    this.amendType = t;
    if (this.selected && (t === 'increase' || t === 'decrease')) {
      this.form.patchValue({ newMinVolume: this.selected.minVolume, newMaxVolume: this.selected.maxVolume });
    }
  }

  /** Extra tanks needed if increasing consumption (rough heuristic per the doc). */
  get extraTanksNeeded(): number {
    if (!this.selected || this.amendType !== 'increase') return 0;
    const newMax = Number(this.form.get('newMaxVolume')?.value) || 0;
    const capacity = this.selected.tanks.reduce((s, t) => s + t.capacity, 0) || 1;
    const needed = Math.ceil(newMax / capacity) - this.selected.tanks.length;
    return needed > 0 ? needed : 0;
  }

  clearSelection(): void { this.selected = null; }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || this.submitted);
  }

  submit(): void {
    this.submitted = true;
    if (!this.selected) return;

    // Contextual validation by amendment type
    const errors: string[] = [];
    if (this.amendType === 'increase' || this.amendType === 'decrease') {
      if (!this.form.get('newMaxVolume')?.value) errors.push('max');
    }
    if (this.amendType === 'shift') {
      if (!this.form.get('tankNo')?.value) errors.push('tank');
      if (!this.form.get('targetContractNo')?.value) errors.push('target');
    }
    if (this.form.get('declaration')?.invalid || errors.length) {
      this.form.markAllAsTouched();
      return;
    }

    const label = this.amendType === 'shift' ? 'Tank Shift'
      : this.amendType === 'increase' ? 'Consumption Increase' : 'Consumption Decrease';

    this.referenceNumber = this.bf.saveApplication({
      type: 'Bulk Fuel — Amendment',
      category: label,
      status: 'Submitted',
      data: { contractNo: this.selected.contractNo, amendType: this.amendType, ...this.form.getRawValue() },
    });
    this.barcodeBars = this.bf.makeBarcode(this.referenceNumber);
    this.showSuccess = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToBulkFuel(): void { this.router.navigate(['/csp/services/bulk-fuel/dashboard']); }
  goToTracking(): void { this.router.navigate(['/csp/track-requests']); }
}
