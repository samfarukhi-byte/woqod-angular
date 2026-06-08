import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { Cheque } from '../../../../models/kenar.model';

@Component({
  selector: 'app-cheques',
  templateUrl: './cheques.component.html',
  styleUrls: ['./cheques.component.scss'],
})
export class ChequesComponent implements OnInit, OnDestroy {
  cheques: Cheque[] = [];
  filteredCheques: Cheque[] = [];
  filterStatus: string = '';
  bouncedChequesCount: number = 0;

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.cheques$.subscribe((cheques) => {
        this.cheques = cheques;
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  applyFilters(): void {
    this.filteredCheques = this.cheques.filter((cheque) => {
      return !this.filterStatus || cheque.status === this.filterStatus;
    });
    this.bouncedChequesCount = this.cheques.filter((c) => this.isBounced(c)).length;
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
      Submitted: 'woqod-badge-info',
      'Pending Deposit': 'woqod-badge-warning',
      Deposited: 'woqod-badge-primary',
      Cleared: 'woqod-badge-success',
      Bounced: 'woqod-badge-danger',
      'Replacement Required': 'woqod-badge-danger',
      Cancelled: 'woqod-badge-secondary',
    };
    return map[status] || 'woqod-badge-secondary';
  }

  hasBouncedCheques(): boolean {
    return this.bouncedChequesCount > 0;
  }

  isBounced(cheque: Cheque): boolean {
    return cheque.status === 'Bounced' || cheque.status === 'Replacement Required';
  }
}
