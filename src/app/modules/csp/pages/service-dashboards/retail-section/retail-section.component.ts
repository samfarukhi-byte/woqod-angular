import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface RetailSectionInfo {
  name: string;
  icon: string;
  tagline: string;
  description: string;
  features: string[];
}

@Component({
  selector: 'app-retail-section',
  templateUrl: './retail-section.component.html',
  styleUrls: ['./retail-section.component.scss'],
})
export class RetailSectionComponent implements OnInit {
  info!: RetailSectionInfo;

  private readonly sections: Record<string, RetailSectionInfo> = {
    woqode: {
      name: 'WOQODe Tag',
      icon: '🏷️',
      tagline: 'Automatic, cashless fuelling for your fleet',
      description:
        'WOQODe is an RFID-based tag that enables automatic, secure and cashless fuel payments at WOQOD stations across Qatar. Manage tags, set vehicle limits, and track consumption in real time.',
      features: ['RFID auto-payment at the pump', 'Per-vehicle spending limits', 'Real-time consumption tracking', 'Consolidated monthly statements'],
    },
    apc: {
      name: 'Autocare Services (APC)',
      icon: '🔧',
      tagline: 'Complete vehicle care at WOQOD',
      description:
        'Auto Parts & Care (APC) offers vehicle servicing, oil changes, tyre care, car wash and genuine auto parts at WOQOD stations — keeping your vehicles road-ready.',
      features: ['Periodic vehicle servicing', 'Oil & filter change', 'Tyre and battery care', 'Automated car wash'],
    },
    sidra: {
      name: 'Sidra Services',
      icon: '🛒',
      tagline: 'Convenience retail at every station',
      description:
        'Sidra convenience stores bring everyday essentials, refreshments and retail offerings to WOQOD stations across Qatar — quick, convenient and always nearby.',
      features: ['Convenience retail stores', 'Refreshments & essentials', 'Loyalty offers', 'Nationwide station coverage'],
    },
  };

  constructor(private readonly route: ActivatedRoute, private readonly router: Router) {}

  ngOnInit(): void {
    const section = this.route.snapshot.paramMap.get('section') ?? 'woqode';
    this.info = this.sections[section] ?? this.sections['woqode'];
  }

  /** Return to the Retail hub (the previous page), not All Services. */
  back(): void {
    this.router.navigate(['/csp/services/retail']);
  }
}
