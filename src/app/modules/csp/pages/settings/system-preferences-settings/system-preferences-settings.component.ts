import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CspService } from '../../../../../core/services/csp.service';
import { SystemPreferences, Language, DateFormat, LOB, SettingsState } from '../../../../../models/settings.model';

@Component({
  selector: 'app-system-preferences-settings',
  templateUrl: './system-preferences-settings.component.html',
  styleUrls: ['./system-preferences-settings.component.scss'],
})
export class SystemPreferencesSettingsComponent implements OnInit, OnDestroy {
  preferences: SystemPreferences = {
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    defaultDashboardView: 'all',
  };

  private sub = new Subscription();

  constructor(private readonly csp: CspService) {}

  ngOnInit(): void {
    this.sub.add(
      this.csp.settingsState$.subscribe((state) => {
        if (state?.systemPreferences) {
          this.preferences = state.systemPreferences;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  updateLanguage(language: Language): void {
    this.preferences = { ...this.preferences, language };
    this.applyLanguage(language);
    this.saveSettings();
  }

  updateDateFormat(dateFormat: DateFormat): void {
    this.preferences = { ...this.preferences, dateFormat };
    this.saveSettings();
  }

  updateDashboardView(view: LOB | 'all'): void {
    this.preferences = { ...this.preferences, defaultDashboardView: view };
    this.saveSettings();
  }

  private applyLanguage(lang: Language): void {
    const body = document.body;
    if (lang === 'ar') {
      body.classList.add('rtl');
      body.setAttribute('dir', 'rtl');
    } else {
      body.classList.remove('rtl');
      body.setAttribute('dir', 'ltr');
    }
  }

  private saveSettings(): void {
    const state = this.csp.getSettingsState();
    if (state) {
      this.csp.updateSettings({
        ...state,
        systemPreferences: this.preferences,
      });
    }
  }
}
