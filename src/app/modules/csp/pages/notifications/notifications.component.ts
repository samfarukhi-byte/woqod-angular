import { Component, OnInit } from '@angular/core';
import { Notification, NotificationType } from '../../../../models/notification.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  activeFilter: 'all' | 'unread' = 'all';
  activeCategory: NotificationType | 'all' = 'all';
  selectedNotification: Notification | null = null;
  showDetailModal = false;
  showAcknowledgeSuccess = false;

  readonly categories: { type: NotificationType | 'all'; label: string; icon: string }[] = [
    { type: 'all', label: 'All', icon: '📋' },
    { type: 'pricing', label: 'Pricing', icon: '⛽' },
    { type: 'downtime', label: 'Downtime', icon: '⚠️' },
    { type: 'invoice', label: 'Invoices', icon: '📄' },
    { type: 'payment', label: 'Payments', icon: '💳' },
    { type: 'system', label: 'System', icon: '🔧' },
    { type: 'promotion', label: 'Offers', icon: '🎁' },
  ];

  ngOnInit(): void {
    this.loadNotifications();
    this.applyFilter();
  }

  loadNotifications(): void {
    // Mock notification data
    this.notifications = [
      {
        id: 'N001',
        type: 'pricing',
        title: 'Fuel Price Update',
        message: 'Petrol 95 price increased to QAR 1.85 per liter effective immediately.',
        imageUrl: 'assets/images/bluebg.png',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        details: 'New fuel prices effective from today:\n\nPetrol 95: QAR 1.85/liter (previously QAR 1.80)\nPetrol 91: QAR 1.75/liter (unchanged)\nDiesel: QAR 1.65/liter (decreased from QAR 1.70)\n\nThese prices reflect the latest market conditions and will remain in effect until the next scheduled price review.'
      },
      {
        id: 'N002',
        type: 'downtime',
        title: 'Station Maintenance Alert',
        message: 'Al Rayyan station will be closed for maintenance on Dec 28, 2024 from 6 AM to 2 PM.',
        imageUrl: 'assets/images/BG_BlueGreen.png',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        details: 'WOQOD Al Rayyan Station Scheduled Maintenance\n\nDate: December 28, 2024\nTime: 6:00 AM - 2:00 PM\n\nDuring this time, the station will be completely closed for essential maintenance work including:\n- Fuel pump system upgrade\n- Safety equipment inspection\n- Tank cleaning and inspection\n\nNearby Alternative Stations:\n- Al Sadd Station (3.2 km)\n- West Bay Station (4.5 km)\n- Education City Station (5.1 km)\n\nWe apologize for any inconvenience.'
      },
      {
        id: 'N003',
        type: 'invoice',
        title: 'Monthly Invoice Ready',
        message: 'Your December 2024 invoice is now available for review. Total amount: QAR 45,320.00',
        imageUrl: 'assets/images/lightgraphics.png',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        details: 'Invoice Summary - December 2024\n\nInvoice Number: INV-2024-12-001\nBilling Period: Dec 1 - Dec 31, 2024\n\nBreakdown:\n- Fuel Charges: QAR 38,500.00\n- APC Services: QAR 5,200.00\n- Bulk Fuel: QAR 1,620.00\n\nTotal Amount Due: QAR 45,320.00\nDue Date: January 15, 2025\n\nPayment Methods:\n- Online Banking\n- Credit Card\n- Bank Transfer\n\nClick "View Invoice" to download the full PDF statement.'
      },
      {
        id: 'N004',
        type: 'payment',
        title: 'Payment Reminder',
        message: 'Payment for Invoice INV-2024-11-001 (QAR 38,450.00) is overdue. Please settle immediately.',
        imageUrl: 'assets/images/Group22.png',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        details: 'Payment Overdue Notice\n\nInvoice Number: INV-2024-11-001\nOriginal Due Date: December 15, 2024\nDays Overdue: 10 days\n\nAmount Outstanding: QAR 38,450.00\nLate Payment Fee: QAR 384.50 (1%)\nTotal Amount Due: QAR 38,834.50\n\nImmediate action required to avoid:\n- Service suspension\n- Additional late fees\n- Credit rating impact\n\nPay Now Options:\n- Online Payment Portal\n- Bank Transfer to Account: QA12WOQO12345678901234\n- Visit WOQOD Finance Department\n\nFor payment arrangements, contact: finance@woqod.com.qa'
      },
      {
        id: 'N005',
        type: 'downtime',
        title: 'System Maintenance Scheduled',
        message: 'WOQOD Customer Portal will undergo maintenance on Dec 30, 2024 from 12 AM to 4 AM.',
        imageUrl: 'assets/images/Group15.png',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        details: 'Scheduled System Maintenance\n\nDate: December 30, 2024\nTime: 12:00 AM - 4:00 AM (Qatar Time)\n\nAffected Services:\n- Customer Portal Login\n- Invoice Download\n- Payment Processing\n- Request Submission\n\nUnaffected Services:\n- Fuel Station Operations\n- Emergency Support Hotline\n\nMaintenance Activities:\n- Database optimization\n- Security updates\n- Performance improvements\n- New feature deployment\n\nWe recommend completing any urgent transactions before the maintenance window.\n\nFor emergency support during maintenance: +974 4444 0700'
      },
      {
        id: 'N006',
        type: 'promotion',
        title: 'Special Discount Offer',
        message: 'Enjoy 5% discount on bulk fuel orders above 10,000 liters. Valid until Jan 31, 2025.',
        imageUrl: 'assets/images/Group 41.png',
        timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        details: 'Limited Time Promotion - Bulk Fuel Discount\n\nOffer Details:\n- 5% discount on bulk fuel orders\n- Minimum order: 10,000 liters\n- Valid for: Diesel and Petrol 95\n\nPromotion Period:\nStart: January 1, 2025\nEnd: January 31, 2025\n\nHow to Avail:\n1. Place bulk order through Customer Portal\n2. Discount automatically applied at checkout\n3. No promo code required\n\nTerms & Conditions:\n- Valid for registered corporate customers only\n- Cannot be combined with other offers\n- Subject to fuel availability\n- Delivery charges apply as per standard rates\n\nFor bulk orders: bulkorders@woqod.com.qa | +974 4444 0750'
      }
    ];
  }

  applyFilter(): void {
    let filtered = this.notifications;

    // Apply category filter
    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(n => n.type === this.activeCategory);
    }

    // Apply read/unread filter
    if (this.activeFilter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }

    this.filteredNotifications = filtered;
  }

  setFilter(filter: 'all' | 'unread'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  setCategory(category: NotificationType | 'all'): void {
    this.activeCategory = category;
    this.applyFilter();
  }

  getCategoryCount(type: NotificationType | 'all'): number {
    if (type === 'all') return this.notifications.length;
    return this.notifications.filter(n => n.type === type).length;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  openDetail(notification: Notification): void {
    this.selectedNotification = notification;
    this.showDetailModal = true;
    if (!notification.isRead) {
      this.markAsRead(notification);
    }
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.showAcknowledgeSuccess = false;
    this.selectedNotification = null;
  }

  acknowledgeNotification(): void {
    if (this.selectedNotification) {
      this.markAsRead(this.selectedNotification);
      this.showAcknowledgeSuccess = true;

      // Auto-close after 1.5 seconds
      setTimeout(() => {
        this.closeDetail();
      }, 1500);
    }
  }

  markAsRead(notification: Notification): void {
    notification.isRead = true;
    this.applyFilter();
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.applyFilter();
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }

  getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      pricing: '⛽',
      downtime: '⚠️',
      invoice: '📄',
      payment: '💳',
      system: '🔧',
      promotion: '🎁'
    };
    return icons[type];
  }

  getNotificationColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      pricing: '#009a33',
      downtime: '#f59e0b',
      invoice: '#3b82f6',
      payment: '#e11d48',
      system: '#8b5cf6',
      promotion: '#10b981'
    };
    return colors[type];
  }
}
