import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CspService } from '../../../../../core/services/csp.service';
import { User, UserRole, LOB, UserStatus, LOBAccess, LOBContact, LOBContactUser } from '../../../../../models/settings.model';

@Component({
  selector: 'app-user-access-settings',
  templateUrl: './user-access-settings.component.html',
  styleUrls: ['./user-access-settings.component.scss'],
})
export class UserAccessSettingsComponent implements OnInit, OnDestroy {
  // Active tab/section
  activeTab: 'overview' | 'users' | 'roles' | 'lob-assignment' = 'overview';

  // Users
  users: User[] = [];
  showUserModal = false;
  editingUser: User | null = null;
  isNewUser = false;

  // Users tab — search & filters
  searchTerm = '';
  filterRole: UserRole | '' = '';
  filterStatus: UserStatus | '' = '';

  // Statistics
  totalUsers = 0;
  activeUsers = 0;
  inactiveUsers = 0;
  usersByRole: Record<UserRole, number> = {
    'Viewer': 0,
    'Editor': 0,
    'Maker': 0,
    'Checker': 0,
    'Super Admin': 0
  };

  // LOB Contacts
  lobContacts: LOBContact[] = [];
  showLOBContactModal = false;
  editingContact: LOBContact | null = null;
  newContactUser: LOBContactUser = {
    userId: '',
    name: '',
    email: '',
    phone: '',
    role: 'Viewer',
  };
  availableRoles: UserRole[] = ['Viewer', 'Editor', 'Maker', 'Checker', 'Super Admin'];
  availableLOBs: LOB[] = ['Fuel', 'APC', 'Bulk Fuel'];

  // Role definitions with permissions
  roleDefinitions = [
    {
      role: 'Super Admin' as UserRole,
      description: 'Full system access with all permissions',
      permissions: ['Manage Users', 'Manage Roles', 'View Reports', 'Edit Profile', 'Submit Requests', 'Approve Requests', 'Manage Settings', 'View All LOBs']
    },
    {
      role: 'Checker' as UserRole,
      description: 'Final approval authority for requests',
      permissions: ['View Reports', 'Edit Profile', 'Submit Requests', 'Final Approval', 'View Assigned LOBs']
    },
    {
      role: 'Maker' as UserRole,
      description: 'Initial review and approval of requests',
      permissions: ['View Reports', 'Edit Profile', 'Submit Requests', 'Initial Approval', 'View Assigned LOBs']
    },
    {
      role: 'Editor' as UserRole,
      description: 'Can edit and submit requests',
      permissions: ['View Reports', 'Edit Profile', 'Submit Requests', 'View Assigned LOBs']
    },
    {
      role: 'Viewer' as UserRole,
      description: 'Read-only access to assigned areas',
      permissions: ['View Reports', 'View Profile', 'View Assigned LOBs']
    }
  ];

  // Confirmation modal
  showConfirmDeactivate = false;
  userToDeactivate: User | null = null;

  // Validation & alerts
  showValidationModal = false;
  validationErrors: string[] = [];
  showSuccessModal = false;
  successMessage = '';
  addUserFormTouched = false;
  saveFormTouched = false;

  private sub = new Subscription();

  constructor(private readonly csp: CspService) {}

  ngOnInit(): void {
    this.sub.add(
      this.csp.users$.subscribe((users) => {
        this.users = users;
        this.calculateStatistics();
      })
    );

    // Subscribe to settings state to get LOB contacts updates
    this.sub.add(
      this.csp.settingsState$.subscribe((settings) => {
        if (settings) {
          this.lobContacts = settings.lobContacts ?? [];
        }
      })
    );
  }

  calculateStatistics(): void {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => u.status === 'Active').length;
    this.inactiveUsers = this.users.filter(u => u.status === 'Inactive').length;

    // Reset role counts
    this.usersByRole = {
      'Viewer': 0,
      'Editor': 0,
      'Maker': 0,
      'Checker': 0,
      'Super Admin': 0
    };

    // Count users by role
    this.users.forEach(user => {
      this.usersByRole[user.role]++;
    });
  }

  setActiveTab(tab: 'overview' | 'users' | 'roles' | 'lob-assignment'): void {
    this.activeTab = tab;
  }

  /** Users filtered by the search box + role + status controls. */
  get filteredUsers(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.users.filter((u) => {
      const matchesTerm =
        !term ||
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone ?? '').toLowerCase().includes(term);
      const matchesRole = !this.filterRole || u.role === this.filterRole;
      const matchesStatus = !this.filterStatus || u.status === this.filterStatus;
      return matchesTerm && matchesRole && matchesStatus;
    });
  }

  get isUserFilterActive(): boolean {
    return !!this.searchTerm || !!this.filterRole || !!this.filterStatus;
  }

  clearUserFilters(): void {
    this.searchTerm = '';
    this.filterRole = '';
    this.filterStatus = '';
  }

  /** Colour-coded badge class per role for clear visual hierarchy. */
  roleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'Super Admin': return 'csp-role-badge--admin';
      case 'Checker': return 'csp-role-badge--checker';
      case 'Maker': return 'csp-role-badge--maker';
      case 'Editor': return 'csp-role-badge--editor';
      default: return 'csp-role-badge--viewer';
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  openAddUserModal(): void {
    this.isNewUser = true;
    this.editingUser = {
      userId: 'USR-' + Date.now(),
      fullName: '',
      email: '',
      role: 'Viewer',
      lobAssignments: [
        { lob: 'Fuel', hasAccess: false },
        { lob: 'APC', hasAccess: false },
        { lob: 'Bulk Fuel', hasAccess: false },
      ],
      status: 'Active',
      lastLogin: null,
      createdDate: new Date().toISOString(),
    };
    this.saveFormTouched = false;
    this.showUserModal = true;
  }

  openEditUserModal(user: User): void {
    this.isNewUser = false;
    this.editingUser = { ...user, lobAssignments: [...user.lobAssignments] };
    this.saveFormTouched = false;
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUser = null;
    this.saveFormTouched = false;
  }

  saveUser(): void {
    if (!this.editingUser) return;

    this.saveFormTouched = true;
    this.validationErrors = [];

    // Validate user fields
    if (!this.editingUser.fullName || this.editingUser.fullName.trim().length < 2) {
      this.validationErrors.push('Full name must be at least 2 characters');
    }

    if (!this.editingUser.email || !this.isValidEmail(this.editingUser.email)) {
      this.validationErrors.push('Valid email address is required');
    }

    if (this.editingUser.phone && this.editingUser.phone.length > 0 && !this.isValidPhone(this.editingUser.phone)) {
      this.validationErrors.push('Valid phone number is required (format: +974-XXXX-XXXX)');
    }

    if (this.validationErrors.length > 0) {
      this.showValidationModal = true;
      return;
    }

    this.csp.saveUser(this.editingUser);
    this.closeUserModal();

    this.successMessage = this.isNewUser
      ? `User ${this.editingUser.fullName} created successfully!`
      : `User ${this.editingUser.fullName} updated successfully!`;
    this.showSuccessModal = true;
  }

  deactivateUser(user: User): void {
    this.userToDeactivate = user;
    this.showConfirmDeactivate = true;
  }

  confirmDeactivate(): void {
    if (this.userToDeactivate) {
      this.csp.saveUser({ ...this.userToDeactivate, status: 'Inactive' });
    }
    this.showConfirmDeactivate = false;
    this.userToDeactivate = null;
  }

  cancelDeactivate(): void {
    this.showConfirmDeactivate = false;
    this.userToDeactivate = null;
  }

  activateUser(user: User): void {
    this.csp.saveUser({ ...user, status: 'Active' });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  getLOBsText(lobAssignments: LOBAccess[]): string {
    const assigned = lobAssignments.filter((lob) => lob.hasAccess).map((lob) => lob.lob);
    return assigned.length > 0 ? assigned.join(', ') : 'None';
  }

  statusBadgeClass(status: UserStatus): string {
    if (status === 'Active') return 'csp-badge--approved';
    if (status === 'Inactive') return 'csp-badge--info';
    return 'csp-badge--warning';
  }

  updateLOBAccess(lob: LOB, hasAccess: boolean): void {
    if (!this.editingUser) return;
    const idx = this.editingUser.lobAssignments.findIndex((l) => l.lob === lob);
    if (idx >= 0) {
      this.editingUser.lobAssignments[idx].hasAccess = hasAccess;
    }
  }

  hasLOBAccess(lob: LOB): boolean {
    if (!this.editingUser) return false;
    return this.editingUser.lobAssignments.find((l) => l.lob === lob)?.hasAccess ?? false;
  }

  // LOB Contact methods
  openEditContactModal(contact: LOBContact): void {
    // Create a deep copy to avoid mutating the original
    this.editingContact = {
      lob: contact.lob,
      department: contact.department,
      users: (contact.users ?? []).map(u => ({
        userId: u.userId,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role
      }))
    };
    this.resetNewContactUser();
    this.addUserFormTouched = false;
    this.saveFormTouched = false;
    this.showLOBContactModal = true;
  }

  closeLOBContactModal(): void {
    this.showLOBContactModal = false;
    this.editingContact = null;
    this.resetNewContactUser();
    this.addUserFormTouched = false;
    this.saveFormTouched = false;
  }

  resetNewContactUser(): void {
    this.newContactUser = {
      userId: '',
      name: '',
      email: '',
      phone: '',
      role: 'Viewer',
    };
    this.addUserFormTouched = false;
  }

  addContactUser(): void {
    if (!this.editingContact) return;

    this.addUserFormTouched = true;
    this.validationErrors = [];

    // Validate new user fields
    if (!this.newContactUser.name || this.newContactUser.name.trim().length < 2) {
      this.validationErrors.push('Name must be at least 2 characters');
    }

    if (!this.newContactUser.email || !this.isValidEmail(this.newContactUser.email)) {
      this.validationErrors.push('Valid email address is required (format: user@example.com)');
    }

    if (!this.newContactUser.phone || !this.isValidPhone(this.newContactUser.phone)) {
      this.validationErrors.push('Valid phone number is required (format: +974-XXXX-XXXX)');
    }

    if (this.validationErrors.length > 0) {
      this.showValidationModal = true;
      return;
    }

    // Generate userId
    const userId = 'U' + Date.now();

    const userToAdd: LOBContactUser = {
      ...this.newContactUser,
      userId,
    };

    this.editingContact.users.push(userToAdd);
    this.resetNewContactUser();
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  isValidPhone(phone: string): boolean {
    if (!phone) return false;
    const phoneRegex = /^\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phoneRegex.test(phone.trim());
  }

  isValidName(name: string): boolean {
    return !!(name && name.trim().length >= 2);
  }

  // Field-level validation helpers for template
  isNewUserNameInvalid(): boolean {
    return this.addUserFormTouched && !this.isValidName(this.newContactUser.name);
  }

  isNewUserEmailInvalid(): boolean {
    return this.addUserFormTouched && this.newContactUser.email.length > 0 && !this.isValidEmail(this.newContactUser.email);
  }

  isNewUserPhoneInvalid(): boolean {
    return this.addUserFormTouched && this.newContactUser.phone.length > 0 && !this.isValidPhone(this.newContactUser.phone);
  }

  // Validation helpers for User modal
  isUserNameInvalid(): boolean {
    return this.saveFormTouched && !!this.editingUser && !this.isValidName(this.editingUser.fullName);
  }

  isUserEmailInvalid(): boolean {
    return this.saveFormTouched && !!this.editingUser && !this.isValidEmail(this.editingUser.email);
  }

  isUserPhoneInvalid(): boolean {
    return this.saveFormTouched && !!this.editingUser && !!this.editingUser.phone && this.editingUser.phone.length > 0 && !this.isValidPhone(this.editingUser.phone);
  }

  removeContactUser(userId: string): void {
    if (!this.editingContact) return;
    this.editingContact.users = this.editingContact.users.filter(u => u.userId !== userId);
  }

  updateContactUserRole(userId: string, role: UserRole): void {
    if (!this.editingContact) return;
    const user = this.editingContact.users.find(u => u.userId === userId);
    if (user) {
      user.role = role;
    }
  }

  saveLOBContact(): void {
    if (!this.editingContact) return;

    this.saveFormTouched = true;
    this.validationErrors = [];

    // Validate at least one user
    if (this.editingContact.users.length === 0) {
      this.validationErrors.push('At least one user must be assigned to this LOB contact');
      this.showValidationModal = true;
      return;
    }

    // Validate each user's data
    for (let i = 0; i < this.editingContact.users.length; i++) {
      const user = this.editingContact.users[i];
      const userLabel = `User ${i + 1} (${user.name || 'Unnamed'})`;

      if (!this.isValidName(user.name)) {
        this.validationErrors.push(`${userLabel}: Name must be at least 2 characters`);
      }
      if (!this.isValidEmail(user.email)) {
        this.validationErrors.push(`${userLabel}: Invalid email format`);
      }
      if (!this.isValidPhone(user.phone)) {
        this.validationErrors.push(`${userLabel}: Invalid phone format`);
      }
    }

    if (this.validationErrors.length > 0) {
      this.showValidationModal = true;
      return;
    }

    // Save to service - the subscription will automatically update the UI
    const lobName = this.editingContact.lob;
    const userCount = this.editingContact.users.length;

    this.csp.saveLOBContact(this.editingContact);
    this.closeLOBContactModal();

    this.successMessage = `${lobName} contact information updated successfully with ${userCount} user(s)!`;
    this.showSuccessModal = true;
  }

  closeValidationModal(): void {
    this.showValidationModal = false;
    this.validationErrors = [];
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.successMessage = '';
  }

  getLOBIcon(lob: LOB): string {
    const icons: Record<LOB, string> = {
      'Fuel': '⛽',
      'APC': '✈️',
      'Bulk Fuel': '🚛',
    };
    return icons[lob];
  }

  getLOBBadgeClass(lob: LOB): string {
    const classes: Record<LOB, string> = {
      'Fuel': 'csp-lob-badge--fuel',
      'APC': 'csp-lob-badge--apc',
      'Bulk Fuel': 'csp-lob-badge--bulk',
    };
    return classes[lob] || '';
  }

  // Get users by role
  getUsersByRole(role: UserRole): User[] {
    return this.users.filter(u => u.role === role);
  }

  // Get users assigned to a specific LOB
  getUsersByLOB(lob: LOB): User[] {
    return this.users.filter(u =>
      u.lobAssignments.some(assignment => assignment.lob === lob && assignment.hasAccess)
    );
  }

  // Get LOB contact by LOB name
  getLOBContact(lob: LOB): LOBContact | undefined {
    return (this.lobContacts ?? []).find(c => c.lob === lob);
  }
}
