import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CspService } from '../../../../core/services/csp.service';
import { Tender } from '../../../../models/home.model';

@Component({
  selector: 'app-tenders',
  templateUrl: './tenders.component.html',
  styleUrls: ['./tenders.component.scss'],
})
export class TendersComponent implements OnInit {
  tendersList: Tender[] = [];
  isLoading = true;
  selectedTender: Tender | null = null;
  showDetailsModal = false;

  constructor(
    private readonly csp: CspService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadTenders();
  }

  loadTenders(): void {
    this.isLoading = true;
    this.tendersList = this.csp.getTenders();
    console.log('Tenders loaded:', this.tendersList);
    console.log('Number of tenders:', this.tendersList.length);
    this.isLoading = false;
  }

  openTenderDetails(tender: Tender): void {
    this.router.navigate(['/csp/tenders', tender.id]);
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  goBack(): void {
    this.router.navigate(['/csp/home']);
  }
}
