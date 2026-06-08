import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { TenantNotification } from '../../../../models/kenar.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: TenantNotification[] = [];
  unreadCount: number = 0;

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.notifications$.subscribe((notifications) => {
        this.notifications = notifications.sort((a, b) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        );
        this.unreadCount = notifications.filter((n) => !n.isRead).length;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  markAsRead(notification: TenantNotification): void {
    if (!notification.isRead) {
      this.kenarService.markNotificationAsRead(notification.notificationId);
    }
  }

  markAllAsRead(): void {
    this.kenarService.markAllNotificationsAsRead();
  }

  getPriorityClass(priority: string): string {
    const map: { [key: string]: string } = {
      Low: 'woqod-notification-low',
      Medium: 'woqod-notification-medium',
      High: 'woqod-notification-high',
    };
    return map[priority] || '';
  }

  getTypeIcon(type: string): string {
    const map: { [key: string]: string } = {
      'Rent Payment Due': '💰',
      'Cheque Due Soon': '🏦',
      'Cheque Bounced': '⚠️',
      'Utility Bill Generated': '⚡',
      'Contract Expiring': '📄',
      'Document Expiring': '📋',
      'Request Updated': '🔔',
      'WOQOD Announcement': '📢',
      'Maintenance Scheduled': '🔧',
      General: 'ℹ️',
    };
    return map[type] || '🔔';
  }
}
