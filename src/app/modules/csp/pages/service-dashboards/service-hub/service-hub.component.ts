import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CspService } from '../../../../../core/services/csp.service';
import { SubService, WoqodService } from '../../../../../models/home.model';

@Component({
  selector: 'app-service-hub',
  templateUrl: './service-hub.component.html',
  styleUrls: ['./service-hub.component.scss'],
})
export class ServiceHubComponent implements OnInit {
  service: WoqodService | null = null;

  private readonly icons: Record<string, string> = {
    RETAIL: '⛽', BULK_FUEL: '🚛', AVIATION: '✈️', BUNKERING: '🚢',
    BITUMEN: '🛣️', FAHES: '🔍', BULK_GAS: '⚡', SHAFAF: '💳', KENAR: '🏪',
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly csp: CspService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      const code = p.get('code') ?? '';
      const svc = this.csp.getWoqodServices().find(
        (s) => s.serviceCode.toLowerCase().replace(/_/g, '-') === code
      );
      if (!svc) {
        this.router.navigate(['/csp/services']);
        return;
      }
      // Leaf services (no sub-sections) go straight to their dashboard.
      if (!svc.subServices || svc.subServices.length === 0) {
        this.router.navigateByUrl(svc.dashboardRoute);
        return;
      }
      this.service = svc;
    });
  }

  icon(code: string): string { return this.icons[code] ?? '🛢️'; }

  open(sub: SubService): void { this.router.navigateByUrl(sub.route); }

  /** Drop a broken image so the emoji icon fallback renders instead. */
  onImageError(sub: SubService): void { sub.imageUrl = undefined; }

  backToServices(): void { this.router.navigate(['/csp/services']); }
}
