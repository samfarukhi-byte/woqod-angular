import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { Announcement } from '../../../../models/kenar.model';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss'],
})
export class AnnouncementsComponent implements OnInit, OnDestroy {
  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];
  filterCategory: string = '';
  filterPriority: string = '';

  categories = [
    'General',
    'Station Specific',
    'Payment',
    'Contract',
    'Maintenance',
    'Policy Update',
    'Safety Instruction',
  ];

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.announcements$.subscribe((announcements) => {
        this.announcements = announcements.sort((a, b) =>
          new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
        );
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  applyFilters(): void {
    this.filteredAnnouncements = this.announcements.filter((announcement) => {
      const matchesCategory = !this.filterCategory || announcement.category === this.filterCategory;
      const matchesPriority = !this.filterPriority || announcement.priority === this.filterPriority;

      return matchesCategory && matchesPriority;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterCategory = '';
    this.filterPriority = '';
    this.applyFilters();
  }

  getPriorityClass(priority: string): string {
    const map: { [key: string]: string } = {
      Low: 'woqod-badge-secondary',
      Medium: 'woqod-badge-info',
      High: 'woqod-badge-warning',
    };
    return map[priority] || 'woqod-badge-secondary';
  }

  getCategoryIcon(category: string): string {
    const map: { [key: string]: string } = {
      General: 'ℹ️',
      'Station Specific': '🏪',
      Payment: '💰',
      Contract: '📄',
      Maintenance: '🔧',
      'Policy Update': '📋',
      'Safety Instruction': '⚠️',
    };
    return map[category] || '📢';
  }

  viewAnnouncement(announcement: Announcement): void {
    // TODO: Open announcement detail modal or navigate to detail page
    console.log('View announcement:', announcement);
    alert(`View announcement: ${announcement.title}`);
  }

  downloadAttachment(announcement: Announcement): void {
    if (announcement.attachmentUrl) {
      // TODO: Implement attachment download
      console.log('Download attachment:', announcement);
      alert(`Download attachment for: ${announcement.title}`);
    }
  }
}
