import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { TenantProfile, Shop } from '../../../../models/kenar.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: TenantProfile | null = null;
  linkedShops: Shop[] = [];

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.tenantProfile$.subscribe((p) => (this.profile = p))
    );

    this.sub.add(
      this.kenarService.shops$.subscribe((shops) => {
        this.linkedShops = shops;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      Active: 'woqod-badge-success',
      Inactive: 'woqod-badge-secondary',
      Suspended: 'woqod-badge-danger',
    };
    return map[status] || 'woqod-badge-secondary';
  }

  getContractStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      Active: 'woqod-badge-success',
      'Expiring Soon': 'woqod-badge-warning',
      Expired: 'woqod-badge-danger',
      Terminated: 'woqod-badge-secondary',
    };
    return map[status] || 'woqod-badge-secondary';
  }

  requestProfileUpdate(): void {
    // TODO: Navigate to request submission or open modal
    alert('Request Profile Update functionality will be implemented');
  }
}
