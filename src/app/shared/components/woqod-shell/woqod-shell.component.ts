import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CspService } from '../../../core/services/csp.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationService } from '../../../core/services/translation.service';
import { SessionUser } from '../../../models/customer.model';
import { AuthUser } from '../../../models/auth.model';

@Component({
  selector: 'app-woqod-shell',
  templateUrl: './woqod-shell.component.html',
  styleUrls: ['./woqod-shell.component.scss'],
})
export class WoqodShellComponent implements OnInit, OnDestroy {
  user: SessionUser | null = null;
  authUser: AuthUser | null = null;
  isProfileDropdownOpen = false;
  isSidebarCollapsed = false;
  isRtl = false;

  private sub = new Subscription();

  constructor(
    private readonly csp: CspService,
    private readonly auth: AuthService,
    private readonly toast: ToastService,
    private readonly i18n: TranslationService,
  ) {}

  ngOnInit(): void {
    this.sub.add(this.csp.currentUser$.subscribe((u) => (this.user = u)));
    this.sub.add(this.auth.user$.subscribe((u) => (this.authUser = u)));
    this.sub.add(this.i18n.lang$.subscribe((l) => (this.isRtl = l === 'ar')));
  }

  /** Whether the current user may see internal Maker/Checker queues. */
  get isInternalUser(): boolean {
    return this.auth.hasRole(['Maker', 'Checker', 'Admin']);
  }

  logout(event?: Event): void {
    event?.preventDefault();
    this.closeProfileDropdown();
    this.auth.logout('manual');
    this.toast.info('You have been signed out.');
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  closeProfileDropdown(): void {
    this.isProfileDropdownOpen = false;
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    document.body.classList.toggle('sidebar-collapsed', this.isSidebarCollapsed);
  }

  toggleLang(): void {
    this.i18n.toggle();
  }
}
