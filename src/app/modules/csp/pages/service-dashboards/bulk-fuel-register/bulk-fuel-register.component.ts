import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BulkFuelService, BulkFuelExistingCustomer } from '../../../../../core/services/bulk-fuel.service';

const DRAFT_KEY = 'bulkFuelDraft';

@Component({
  selector: 'app-bulk-fuel-register',
  templateUrl: './bulk-fuel-register.component.html',
  styleUrls: ['./bulk-fuel-register.component.scss'],
})
export class BulkFuelRegisterComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  savedDraftAt: string | null = null;

  // ----- Wizard state -------------------------------------------------------
  currentStep = 0;
  readonly steps = [
    { label: 'Scope', icon: '🎯' },
    { label: 'Applicant', icon: '🏢' },
    { label: 'Addresses', icon: '📍' },
    { label: 'Contacts', icon: '👥' },
    { label: 'Legal', icon: '📜' },
    { label: 'Products', icon: '⛽' },
    { label: 'Tanks & Docs', icon: '🛢️' },
    { label: 'Review', icon: '✅' },
  ];

  // Success state
  showSuccess = false;
  referenceNumber = '';
  barcodeBars: number[] = [];

  // Scope options (covers requirement sections 1.1–1.7)
  readonly applicantTypes = ['New Customer', 'Existing Customer'];
  readonly categories = ['Standard Contract', 'Event Contract', 'Government & Subsidiaries', 'Semi-Government'];

  existingCustomers: BulkFuelExistingCustomer[] = [];

  // Reference data ----------------------------------------------------------
  readonly applicantClassifications = [
    'Project / Construction', 'Farms', 'Generator Supply', 'Vessel / Rig Supply',
    'WOQOD Internal Use', 'Hotels / Bakery', 'One Time Supply',
    'Workshop / Factory / Manufacturing', 'Labor Camp', 'Event',
    'Transportation / Equipment', 'Laundry', 'Roads / Works', 'Personal',
  ];
  readonly cities = [
    'Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Al Shamal', 'Al Daayen',
    'Umm Salal', 'Al Shahaniya', 'Dukhan', 'Mesaieed', 'Ras Laffan', 'Lusail',
    'Al Wukair', 'Al Gharrafa', 'Al Sailiya',
  ];
  readonly nationalities = [
    'Qatari', 'Saudi', 'Emirati', 'Bahraini', 'Kuwaiti', 'Omani', 'Egyptian',
    'Indian', 'Pakistani', 'Bangladeshi', 'Filipino', 'British', 'American', 'Other',
  ];
  readonly classifications = ['Commercial Registration', 'Free Zone', 'International Trade License'];
  readonly classificationTypes = ['Establishment', 'Joint Venture', 'Semi-Government'];
  readonly fuelProducts = ['Gasoil (Diesel)', 'Premium (91 RON)', 'Super (95 RON)', 'Kerosene'];
  readonly storageTypes = ['WOQOD Tank', 'Own Tank'];
  readonly deliveredByOptions = ['By WOQOD', 'Self Collection'];
  readonly supplyTypes = ['Bulk Tanker', 'Bowser', 'Drums'];

  stagedDocs: { name: string; size: string }[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly bf: BulkFuelService,
  ) {}

  ngOnInit(): void {
    this.existingCustomers = this.bf.getExistingCustomers();

    this.form = this.fb.group({
      // 0 — Contract scope (sections 1.1–1.7)
      applicantType: ['New Customer', Validators.required],
      category: ['Standard Contract', Validators.required],
      existingCustomerId: [''],

      // Event details (Event Contract)
      event: this.fb.group({
        eventName: [''], venue: [''], eventStart: [''], eventEnd: [''],
      }),
      // Entity details (Government / Semi-Government)
      entity: this.fb.group({
        entityName: [''], tenderNo: [''], budgetCode: [''],
      }),

      // 1 — Applicant & Project details
      applicantClassification: ['', Validators.required],
      customerName: ['', [Validators.required, Validators.maxLength(500)]],
      customerNameAr: ['', Validators.maxLength(500)],
      projectLocation: ['', Validators.maxLength(500)],
      projectStartDate: [''],
      projectEndDate: [''],
      purposeOfBusiness: ['', Validators.maxLength(1000)],
      mainContractorDetails: ['', Validators.maxLength(1000)],

      // 2 — Addresses
      companyAddress: this.buildAddressGroup(true),
      projectAddress: this.buildAddressGroup(false),
      purchaserAddress: this.buildAddressGroup(false),

      // 3 — Contacts
      contacts: this.fb.array([this.buildContact()]),

      // 4 — Legal / Trade registration
      legalName: ['', [Validators.required, Validators.maxLength(500)]],
      nationality: [''],
      classification: ['', Validators.required],
      classificationType: [''],
      registrationNumber: ['', Validators.maxLength(50)],
      registrationStartDate: [''],
      registrationEndDate: [''],

      // 5 — Project equipment
      equipment: this.fb.array([this.buildEquipment()]),

      // 6 — Products required
      products: this.fb.array([this.buildProduct()]),
      estimatedAnnualVolume: [''],

      // 7 — Tank information
      tanks: this.fb.array([this.buildTank()]),

      // 9 — Declaration
      declaration: [false, Validators.requiredTrue],
    });

    // Preset scope from the hub action (query params), if provided.
    const qp = this.route.snapshot.queryParamMap;
    const at = qp.get('applicantType');
    const cat = qp.get('category');
    if (at && this.applicantTypes.includes(at)) this.form.patchValue({ applicantType: at });
    if (cat && this.categories.includes(cat)) this.form.patchValue({ category: cat });

    this.restoreDraft();
  }

  // ----- Scope getters ------------------------------------------------------
  get isExisting(): boolean { return this.form?.get('applicantType')?.value === 'Existing Customer'; }
  get isEvent(): boolean { return this.form?.get('category')?.value === 'Event Contract'; }
  get isGovernment(): boolean {
    const c = this.form?.get('category')?.value;
    return c === 'Government & Subsidiaries' || c === 'Semi-Government';
  }

  get scopeLabel(): string {
    return `Bulk Fuel — ${this.form.get('applicantType')?.value} / ${this.form.get('category')?.value}`;
  }

  onExistingCustomerChange(): void {
    const id = this.form.get('existingCustomerId')?.value;
    const c = this.bf.getCustomerById(id);
    if (!c) return;
    this.form.patchValue({
      customerName: c.customerName,
      legalName: c.legalName,
      classification: c.classification,
      registrationNumber: c.crNumber,
      companyAddress: { address1: c.address1, city: c.city, poBox: c.poBox, mobile: c.mobile },
    });
  }

  // ----- FormArray builders -------------------------------------------------
  private buildAddressGroup(required: boolean): FormGroup {
    return this.fb.group({
      address1: ['', required ? Validators.required : []],
      address2: [''], zone: [''], street: [''], building: [''], city: [''], poBox: [''],
      mobile: ['', Validators.pattern(/^\+?[0-9\-\s()]{6,20}$/)],
      fax: [''],
    });
  }
  private buildContact(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      designation: ['', Validators.maxLength(250)],
      nationality: [''],
      mobile: ['', [Validators.required, Validators.pattern(/^\+?[0-9\-\s()]{6,20}$/)]],
      landline: ['', Validators.pattern(/^\+?[0-9\-\s()]{0,20}$/)],
      email: ['', Validators.email],
      taxNumber: ['', Validators.maxLength(50)],
    });
  }
  private buildEquipment(): FormGroup {
    return this.fb.group({
      equipmentType: ['', Validators.maxLength(250)], number: [''], weeklyConsumption: [''], brand: ['', Validators.maxLength(250)],
    });
  }
  private buildProduct(): FormGroup {
    return this.fb.group({ productName: ['', Validators.required], minVolume: [''], maxVolume: [''] });
  }
  private buildTank(): FormGroup {
    return this.fb.group({ storageType: [''], deliveredBy: [''], supplyType: [''], tankCapacity: [''] });
  }

  // ----- FormArray accessors ------------------------------------------------
  get contacts(): FormArray { return this.form.get('contacts') as FormArray; }
  get equipment(): FormArray { return this.form.get('equipment') as FormArray; }
  get products(): FormArray { return this.form.get('products') as FormArray; }
  get tanks(): FormArray { return this.form.get('tanks') as FormArray; }

  addContact(): void { this.contacts.push(this.buildContact()); }
  removeContact(i: number): void { if (this.contacts.length > 1) this.contacts.removeAt(i); }
  addEquipment(): void { this.equipment.push(this.buildEquipment()); }
  removeEquipment(i: number): void { if (this.equipment.length > 1) this.equipment.removeAt(i); }
  addProduct(): void { this.products.push(this.buildProduct()); }
  removeProduct(i: number): void { if (this.products.length > 1) this.products.removeAt(i); }
  addTank(): void { this.tanks.push(this.buildTank()); }
  removeTank(i: number): void { if (this.tanks.length > 1) this.tanks.removeAt(i); }

  // ----- Validation helpers -------------------------------------------------
  invalid(path: string): boolean {
    const c = this.form.get(path);
    return !!c && c.invalid && (c.touched || this.submitted);
  }
  invalidIn(group: FormGroup, name: string): boolean {
    const c = group.get(name);
    return !!c && c.invalid && (c.touched || this.submitted);
  }

  // ----- Wizard navigation --------------------------------------------------
  /** Required control paths per step (FormArrays handled in validateStep). */
  private stepFields(step: number): string[] {
    switch (step) {
      case 0: return ['applicantType', 'category'];
      case 1: return ['applicantClassification', 'customerName'];
      case 2: return ['companyAddress.address1'];
      case 4: return ['legalName', 'classification'];
      case 7: return ['declaration'];
      default: return [];
    }
  }

  /** Validate one step, marking its controls touched. Returns true if valid. */
  validateStep(step: number): boolean {
    let ok = true;
    if (step === 3) {
      this.contacts.controls.forEach((c) => ['name', 'mobile'].forEach((n) => {
        const ctrl = c.get(n); ctrl?.markAsTouched(); if (ctrl?.invalid) ok = false;
      }));
    } else if (step === 5) {
      this.products.controls.forEach((p) => {
        const ctrl = p.get('productName'); ctrl?.markAsTouched(); if (ctrl?.invalid) ok = false;
      });
    }
    this.stepFields(step).forEach((f) => {
      const c = this.form.get(f); c?.markAsTouched(); if (c?.invalid) ok = false;
    });
    return ok;
  }

  next(): void {
    if (!this.validateStep(this.currentStep)) { this.scrollToError(); return; }
    if (this.currentStep < this.steps.length - 1) { this.currentStep++; this.scrollToTop(); }
  }

  prev(): void {
    if (this.currentStep > 0) { this.currentStep--; this.scrollToTop(); }
  }

  /** Jump to a step: backwards freely; forwards only if all intermediate steps are valid. */
  goToStep(target: number): void {
    if (target <= this.currentStep) { this.currentStep = target; this.scrollToTop(); return; }
    for (let s = this.currentStep; s < target; s++) {
      if (!this.validateStep(s)) { this.currentStep = s; this.scrollToError(); return; }
    }
    this.currentStep = target;
    this.scrollToTop();
  }

  stepState(i: number): 'done' | 'active' | 'upcoming' {
    if (i < this.currentStep) return 'done';
    if (i === this.currentStep) return 'active';
    return 'upcoming';
  }

  private scrollToTop(): void {
    setTimeout(() => document.querySelector('.csp-bf-stepper')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }
  private scrollToError(): void {
    setTimeout(() => document.querySelector('.csp-form-group--invalid, .ng-invalid.ng-touched')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  }

  // ----- Review summary helpers --------------------------------------------
  get reviewProducts(): string {
    const list = (this.products.value || []).map((p: any) => p.productName).filter(Boolean);
    return list.length ? list.join(', ') : '—';
  }

  // ----- Documents ----------------------------------------------------------
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).forEach((f) => this.stagedDocs.push({ name: f.name, size: this.formatSize(f.size) }));
    input.value = '';
  }
  removeDoc(i: number): void { this.stagedDocs.splice(i, 1); }
  private formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ----- Save draft / Apply -------------------------------------------------
  saveDraft(): void {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form: this.form.getRawValue(), docs: this.stagedDocs }));
    this.savedDraftAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  }
  private restoreDraft(): void {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data?.form) {
        this.syncArray(this.contacts, data.form.contacts?.length ?? 1, () => this.buildContact());
        this.syncArray(this.equipment, data.form.equipment?.length ?? 1, () => this.buildEquipment());
        this.syncArray(this.products, data.form.products?.length ?? 1, () => this.buildProduct());
        this.syncArray(this.tanks, data.form.tanks?.length ?? 1, () => this.buildTank());
        this.form.patchValue(data.form);
      }
      if (Array.isArray(data?.docs)) this.stagedDocs = data.docs;
    } catch { /* ignore */ }
  }
  private syncArray(arr: FormArray, target: number, factory: () => FormGroup): void {
    while (arr.length < target) arr.push(factory());
    while (arr.length > target && arr.length > 1) arr.removeAt(arr.length - 1);
  }

  apply(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      setTimeout(() => document.querySelector('.csp-form-group--invalid, .ng-invalid.ng-touched')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
      return;
    }

    const typeLabel = this.scopeLabel;
    this.referenceNumber = this.bf.saveApplication({
      type: typeLabel,
      category: this.form.get('category')?.value,
      applicantType: this.form.get('applicantType')?.value,
      status: 'Submitted',
      validUntil: this.bf.addMonths(new Date(), 1).toISOString(),
      data: this.form.getRawValue(),
      documents: this.stagedDocs,
    });
    this.barcodeBars = this.bf.makeBarcode(this.referenceNumber);
    localStorage.removeItem(DRAFT_KEY);

    this.showSuccess = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  validUntilLabel(): string {
    return this.bf.addMonths(new Date(), 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ----- Navigation ---------------------------------------------------------
  goToTracking(): void { this.router.navigate(['/csp/track-requests']); }
  backToBulkFuel(): void { this.router.navigate(['/csp/services/bulk-fuel/dashboard']); }
  newApplication(): void {
    this.showSuccess = false;
    this.submitted = false;
    this.currentStep = 0;
    this.stagedDocs = [];
    this.form.reset({ applicantType: 'New Customer', category: 'Standard Contract', declaration: false });
    this.syncArray(this.contacts, 1, () => this.buildContact());
    this.syncArray(this.equipment, 1, () => this.buildEquipment());
    this.syncArray(this.products, 1, () => this.buildProduct());
    this.syncArray(this.tanks, 1, () => this.buildTank());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
