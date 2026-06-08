export type NotificationType = 'pricing' | 'downtime' | 'invoice' | 'payment' | 'system' | 'promotion';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  imageUrl?: string;
  timestamp: string;
  isRead: boolean;
  details?: string;
  actionUrl?: string;
}
