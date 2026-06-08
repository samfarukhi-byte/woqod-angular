import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  constructor(private readonly router: Router) {}

  goToProfile(): Promise<boolean> { return this.router.navigate(['/csp/profile']); }
  goToEditProfile(): Promise<boolean> { return this.router.navigate(['/csp/edit-profile']); }
  goToDocuments(): Promise<boolean> { return this.router.navigate(['/csp/documents']); }
  goToReviewChanges(): Promise<boolean> { return this.router.navigate(['/csp/review-changes']); }
  goToTrackRequests(): Promise<boolean> { return this.router.navigate(['/csp/track-requests']); }
  goToMakerReview(): Promise<boolean> { return this.router.navigate(['/csp/maker-review']); }
  goToCheckerApproval(): Promise<boolean> { return this.router.navigate(['/csp/checker-approval']); }
  goToDashboard(): Promise<boolean> { return this.router.navigate(['/']); }

  goBack(): void {
    window.history.back();
  }
}
