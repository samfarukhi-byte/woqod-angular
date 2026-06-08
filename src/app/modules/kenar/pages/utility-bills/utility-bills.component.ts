import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { UtilityBill, Shop } from '../../../../models/kenar.model';

@Component({
  selector: 'app-utility-bills',
  templateUrl: './utility-bills.component.html',
  styleUrls: ['./utility-bills.component.scss'],
})
export class UtilityBillsComponent implements OnInit, OnDestroy {
  utilityBills: UtilityBill[] = [];
  filteredBills: UtilityBill[] = [];
  shops: Shop[] = [];

  filterShop: string = '';
  filterUtilityType: string = '';
  filterStatus: string = '';

  utilityTypes = [
    'Electricity',
    'Water',
    'Cooling',
    'Common Area Maintenance',
    'Other Charges',
  ];

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.utilityBills$.subscribe((bills) => {
        this.utilityBills = bills;
        this.applyFilters();
      })
    );

    this.sub.add(
      this.kenarService.shops$.subscribe((shops) => {
        this.shops = shops;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  applyFilters(): void {
    this.filteredBills = this.utilityBills.filter((bill) => {
      const matchesShop = !this.filterShop || bill.shopCode === this.filterShop;
      const matchesType = !this.filterUtilityType || bill.utilityType === this.filterUtilityType;
      const matchesStatus = !this.filterStatus || bill.paymentStatus === this.filterStatus;

      return matchesShop && matchesType && matchesStatus;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterShop = '';
    this.filterUtilityType = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      Paid: 'woqod-badge-success',
      Pending: 'woqod-badge-warning',
      Overdue: 'woqod-badge-danger',
    };
    return map[status] || 'woqod-badge-secondary';
  }

  viewBill(bill: UtilityBill): void {
    console.log('View bill:', bill);
    // TODO: Open bill details modal
  }

  downloadBill(bill: UtilityBill): void {
    console.log('Download bill:', bill);
    // TODO: Implement bill download
  }

  raiseDispute(bill: UtilityBill): void {
    console.log('Raise dispute for bill:', bill);
    // TODO: Navigate to request submission or open modal
  }
}
