import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CspService } from '../../../../core/services/csp.service';
import { Tender } from '../../../../models/home.model';

@Component({
  selector: 'app-tender-details',
  templateUrl: './tender-details.component.html',
  styleUrls: ['./tender-details.component.scss']
})
export class TenderDetailsComponent implements OnInit {
  tender: Tender | null = null;
  isLoading = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly csp: CspService
  ) {}

  ngOnInit(): void {
    const tenderId = this.route.snapshot.paramMap.get('id');
    if (tenderId) {
      this.loadTender(tenderId);
    } else {
      this.router.navigate(['/csp/tenders']);
    }
  }

  loadTender(id: string): void {
    this.isLoading = true;
    this.tender = this.csp.getTenderById(id);
    this.isLoading = false;

    if (!this.tender) {
      this.router.navigate(['/csp/tenders']);
    }
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
    this.router.navigate(['/csp/tenders']);
  }

  downloadDocument(): void {
    if (this.tender?.tenderUrl) {
      window.open(this.tender.tenderUrl, '_blank');
    }
  }
}
