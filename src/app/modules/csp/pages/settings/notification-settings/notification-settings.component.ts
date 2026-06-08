import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CspService } from '../../../../../core/services/csp.service';
import { NotificationPreferences, AlertType, SettingsState } from '../../../../../models/settings.model';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss'],
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {
  preferences: NotificationPreferences = {
    channels: { email: true, sms: false, push: true },
    alertTypes: {
      fuel_prices: true,
      station_downtime: true,
      system_downtime: true,
      announcements: true,
      monthly_invoices: true,
      payment_due: true,
      request_status: true,
      promotions: false,
      account_activity: true,
    },
  };

  private sub = new Subscription();

  constructor(private readonly csp: CspService) {}

  ngOnInit(): void {
    this.sub.add(
      this.csp.settingsState$.subscribe((state) => {
        if (state?.notificationPreferences) {
          this.preferences = state.notificationPreferences;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleChannel(channel: 'email' | 'sms' | 'push', enabled: boolean): void {
    this.preferences.channels[channel] = enabled;
    this.saveSettings();
  }

  toggleAlertType(alertType: AlertType, enabled: boolean): void {
    this.preferences.alertTypes[alertType] = enabled;
    this.saveSettings();
  }

  private saveSettings(): void {
    const state = this.csp.getSettingsState();
    if (state) {
      this.csp.updateSettings({
        ...state,
        notificationPreferences: this.preferences,
      });
    }
  }
}
