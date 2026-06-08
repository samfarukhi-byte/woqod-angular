import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { Contract } from '../../../../models/kenar.model';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
})
export class ContractsComponent implements OnInit, OnDestroy {
  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];
  filterStatus: string = '';

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.contracts$.subscribe((contracts) => {
        this.contracts = contracts;
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  applyFilters(): void {
    this.filteredContracts = this.contracts.filter((contract) => {
      return !this.filterStatus || contract.contractStatus === this.filterStatus;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      Active: 'woqod-badge-success',
      'Expiring Soon': 'woqod-badge-warning',
      Expired: 'woqod-badge-danger',
      'Renewal Pending': 'woqod-badge-info',
      Terminated: 'woqod-badge-secondary',
    };
    return map[status] || 'woqod-badge-secondary';
  }

  viewContract(contract: Contract): void {
    // TODO: Open contract detail modal
    console.log('View contract:', contract);
    alert(`View contract ${contract.contractNumber}`);
  }

  viewDetails(contract: Contract): void {
    // TODO: Open contract detail modal
    console.log('View contract details:', contract);
  }

  requestRenewal(contract: Contract): void {
    // TODO: Navigate to request submission or open modal
    console.log('Request renewal:', contract);
    alert(`Request renewal for contract ${contract.contractNumber}`);
  }
}
