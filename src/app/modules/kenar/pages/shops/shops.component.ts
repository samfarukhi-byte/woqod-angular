import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { Shop } from '../../../../models/kenar.model';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.component.html',
  styleUrls: ['./shops.component.scss'],
})
export class ShopsComponent implements OnInit, OnDestroy {
  shops: Shop[] = [];
  filteredShops: Shop[] = [];
  searchTerm: string = '';
  filterStatus: string = '';

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.shops$.subscribe((shops) => {
        this.shops = shops;
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  applyFilters(): void {
    this.filteredShops = this.shops.filter((shop) => {
      const matchesSearch = !this.searchTerm ||
        shop.shopCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        shop.stationName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        shop.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        shop.shopType.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.filterStatus || shop.contractStatus === this.filterStatus;

      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      Active: 'woqod-badge-success',
      'Expiring Soon': 'woqod-badge-warning',
      Expired: 'woqod-badge-danger',
      Terminated: 'woqod-badge-secondary',
    };
    return map[status] || 'woqod-badge-secondary';
  }

  viewShopDetail(shop: Shop): void {
    // TODO: Open shop detail modal
    console.log('View shop detail:', shop);
  }

  openShopDetail(shop: Shop): void {
    this.viewShopDetail(shop);
  }

  viewShopDetails(shop: Shop): void {
    this.viewShopDetail(shop);
  }

  getContractStatusClass(status: string): string {
    return this.getStatusClass(status);
  }

  getOperationalStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      Operational: 'woqod-badge-success',
      'Under Maintenance': 'woqod-badge-warning',
      Closed: 'woqod-badge-danger',
    };
    return map[status] || 'woqod-badge-secondary';
  }
}
