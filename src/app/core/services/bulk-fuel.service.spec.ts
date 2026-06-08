import { TestBed } from '@angular/core/testing';
import { BulkFuelService } from './bulk-fuel.service';

describe('BulkFuelService', () => {
  let service: BulkFuelService;

  beforeEach(() => {
    localStorage.removeItem('bulkFuelApplications');
    TestBed.configureTestingModule({});
    service = TestBed.inject(BulkFuelService);
  });

  it('returns only active contracts from getActiveContracts()', () => {
    const active = service.getActiveContracts();
    expect(active.length).toBeGreaterThan(0);
    expect(active.every((c) => c.status === 'Active')).toBeTrue();
  });

  it('generates type-specific reference prefixes', () => {
    expect(service.generateReference('Bulk Fuel — Termination')).toMatch(/^BF-TR-/);
    expect(service.generateReference('Bulk Fuel — Amendment')).toMatch(/^BF-AM-/);
    expect(service.generateReference('Bulk Fuel — New Customer / Standard Contract')).toMatch(/^BF-NC-/);
    expect(service.generateReference('Bulk Fuel — Existing Customer / Event Contract')).toMatch(/^BF-EV-/);
  });

  it('builds a non-empty barcode from a reference', () => {
    expect(service.makeBarcode('BF-NC-20260101-1234').length).toBeGreaterThan(0);
  });

  it('persists an application and returns its reference', () => {
    const ref = service.saveApplication({ type: 'Bulk Fuel — Termination', status: 'Submitted', data: { contractNo: 'X' } });
    expect(ref).toMatch(/^BF-TR-/);
    const list = service.listApplications();
    expect(list.length).toBe(1);
    expect(list[0].referenceNumber).toBe(ref);
  });

  it('adds months correctly', () => {
    const d = service.addMonths(new Date('2026-01-15'), 1);
    expect(d.getMonth()).toBe(1); // February
  });
});
