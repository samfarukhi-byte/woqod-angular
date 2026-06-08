import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CspService } from '../../../../core/services/csp.service';
import { WoqodService, ServiceCode } from '../../../../models/home.model';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit {
  services: WoqodService[] = [];
  isLoading = true;

  /** Emoji icon per service (matches the sidebar / brand language). */
  private readonly serviceIcons: Record<string, string> = {
    RETAIL: '⛽', BULK_FUEL: '🚛', AVIATION: '✈️', BUNKERING: '🚢',
    BITUMEN: '🛣️', FAHES: '🔍', BULK_GAS: '⚡', SHAFAF: '💳', KENAR: '🏪',
  };

  serviceIcon(code: string): string {
    return this.serviceIcons[code] ?? '🛢️';
  }

  /** Hide a broken service image so the emoji + gradient fallback shows through. */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  isHub(service: WoqodService): boolean {
    return !!service.subServices && service.subServices.length > 0;
  }

  /** URL-friendly code, e.g. BULK_FUEL → bulk-fuel. */
  urlCode(service: WoqodService): string {
    return service.serviceCode.toLowerCase().replace(/_/g, '-');
  }

  // Not eligible modal
  showNotEligibleModal = false;
  selectedService: WoqodService | null = null;

  constructor(
    private readonly csp: CspService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.services = this.csp.getWoqodServices();
    this.isLoading = false;
  }

  onServiceClick(service: WoqodService): void {
    // Hub services (with sub-sections) open their own hub page.
    if (this.isHub(service)) {
      this.router.navigate(['/csp/services', this.urlCode(service)]);
      return;
    }

    const result = this.csp.validateServiceEligibility(service.serviceCode);
    if (result.isEligible && result.data?.dashboardRoute) {
      this.router.navigateByUrl(result.data.dashboardRoute);
    } else {
      this.selectedService = service;
      this.showNotEligibleModal = true;
    }
  }

  closeNotEligibleModal(): void {
    this.showNotEligibleModal = false;
    this.selectedService = null;
  }

  recordInterest(): void {
    if (!this.selectedService) return;

    const result = this.csp.recordServiceInterest(
      this.selectedService.serviceCode,
      this.selectedService.serviceName
    );

    if (result.success) {
      alert(result.message);
      this.closeNotEligibleModal();
    }
  }

  goBack(): void {
    this.router.navigate(['/csp/home']);
  }
}
