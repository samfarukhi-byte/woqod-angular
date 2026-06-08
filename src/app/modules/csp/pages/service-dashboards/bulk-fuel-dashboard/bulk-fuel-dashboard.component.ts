import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface BulkFuelProduct {
  name: string;
  spec: string;
  description: string;
  icon: string;
  accent: string;
}

@Component({
  selector: 'app-bulk-fuel-dashboard',
  templateUrl: './bulk-fuel-dashboard.component.html',
  styleUrls: ['./bulk-fuel-dashboard.component.scss'],
})
export class BulkFuelDashboardComponent {
  /** Whether the "Avail Bulk Fuel Supply" details panel is revealed. */
  showDetails = false;

  readonly products: BulkFuelProduct[] = [
    {
      name: 'Gasoil (Diesel)',
      spec: 'Ultra-Low-Sulfur Diesel · < 10 ppm sulfur',
      description:
        'Gasoil complies with the specification of less than 10 ppm sulfur content and is categorised as Ultra-Low-Sulfur Diesel (ULSD). Suitable for all diesel-powered vehicles — including cars and trucks — and for industrial applications such as generators.',
      icon: '🛢️',
      accent: 'csp-bf-product--diesel',
    },
    {
      name: 'Premium (91 RON)',
      spec: 'Gasoline · 91 Research Octane Number',
      description:
        'Provides excellent performance for both new and older petrol-driven vehicles. RON is the globally accepted measure for product classification and certification.',
      icon: '⛽',
      accent: 'csp-bf-product--premium',
    },
    {
      name: 'Super (95 RON)',
      spec: 'Gasoline · 95 Research Octane Number',
      description:
        'Offers a higher octane, making it suitable for high-performance petrol-driven vehicles. One of Qatar’s two standard grades of gasoline measured using the RON rating.',
      icon: '⛽',
      accent: 'csp-bf-product--super',
    },
    {
      name: 'Kerosene',
      spec: 'Medium-weight distillate',
      description:
        'Kerosene is a medium-weight, flammable liquid distillate produced during the refining process.',
      icon: '🔥',
      accent: 'csp-bf-product--kerosene',
    },
  ];

  readonly actions = [
    { icon: '📝', title: 'Apply for New Contract', desc: 'New or existing customer — standard, event, government or semi-government bulk fuel contract.', route: '/csp/services/bulk-fuel/register', accent: 'csp-bf-action--green' },
    { icon: '✏️', title: 'Amend Contract', desc: 'Increase or decrease consumption, manage or shift tanks on an active contract.', route: '/csp/services/bulk-fuel/amend', accent: 'csp-bf-action--blue' },
    { icon: '⛔', title: 'Terminate Contract', desc: 'Request termination of an active bulk fuel contract.', route: '/csp/services/bulk-fuel/terminate', accent: 'csp-bf-action--red' },
    { icon: '🧾', title: 'Invoices & Reports', desc: 'View invoices and generate the contract-status report for your bulk fuel products.', route: '/csp/services/bulk-fuel/invoices', accent: 'csp-bf-action--amber' },
    { icon: '🔍', title: 'Periodic Inspection', desc: 'View the scheduled periodic inspection of your tanks for active contracts.', route: '/csp/services/bulk-fuel/inspection', accent: 'csp-bf-action--purple' },
  ];

  constructor(private readonly router: Router) {}

  availSupply(): void {
    this.showDetails = true;
    // Smoothly bring the revealed details into view on the next tick.
    setTimeout(() => {
      document.getElementById('bf-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  register(): void {
    this.router.navigate(['/csp/services/bulk-fuel/register']);
  }

  go(route: string): void {
    this.router.navigate([route]);
  }
}
