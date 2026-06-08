import { Component, OnInit } from '@angular/core';
import { CspService } from '../../../../../core/services/csp.service';
import { CustomerAPICredential } from '../../../../../models/open-api.model';
import { APIEndpoint } from '../../../../../models/settings.model';

@Component({
  selector: 'app-api-integration-settings',
  templateUrl: './api-integration-settings.component.html',
  styleUrls: ['./api-integration-settings.component.scss'],
})
export class ApiIntegrationSettingsComponent implements OnInit {
  apiCredential: CustomerAPICredential | null = null;
  apiEnabled = false;
  availableEndpoints: APIEndpoint[] = [];

  // Modals
  showGenerateModal = false;
  showRegenerateModal = false;
  showRevokeModal = false;
  showSuccessModal = false;
  showSecretModal = false;
  showEndpointModal = false;

  successMessage = '';
  generatedCredential: CustomerAPICredential | null = null;
  selectedEndpoint: APIEndpoint | null = null;

  constructor(private readonly csp: CspService) {}

  ngOnInit(): void {
    this.loadAPICredential();
    this.loadAvailableEndpoints();
  }

  loadAPICredential(): void {
    this.apiCredential = this.csp.getCustomerAPICredential();
    this.apiEnabled = this.apiCredential?.isEnabled ?? false;
  }

  loadAvailableEndpoints(): void {
    // Define all available Open API endpoints
    this.availableEndpoints = [
      {
        endpointId: 'EP-001',
        name: 'Get Customer Profile',
        category: 'Billing',
        method: 'GET',
        path: '/api/open/v1/customer/profile',
        description: 'Retrieve authenticated customer profile details',
        requiresAuth: true,
        rateLimit: '100 requests/minute',
      },
      {
        endpointId: 'EP-002',
        name: 'Get Customer Invoices',
        category: 'Billing',
        method: 'GET',
        path: '/api/open/v1/invoices',
        description: 'Get paginated list of customer invoices with optional filters',
        requiresAuth: true,
        rateLimit: '100 requests/minute',
      },
      {
        endpointId: 'EP-003',
        name: 'Get Invoice Details',
        category: 'Billing',
        method: 'GET',
        path: '/api/open/v1/invoices/{invoiceNumber}',
        description: 'Retrieve detailed invoice information including line items',
        requiresAuth: true,
        rateLimit: '100 requests/minute',
      },
      {
        endpointId: 'EP-004',
        name: 'Get Consumption Summary',
        category: 'Consumption',
        method: 'GET',
        path: '/api/open/v1/consumption/summary',
        description: 'Get aggregated consumption summary by fuel type and vehicle',
        requiresAuth: true,
        rateLimit: '100 requests/minute',
      },
      {
        endpointId: 'EP-005',
        name: 'Get Consumption Transactions',
        category: 'Consumption',
        method: 'GET',
        path: '/api/open/v1/consumption/transactions',
        description: 'Retrieve detailed transaction-level consumption records',
        requiresAuth: true,
        rateLimit: '100 requests/minute',
      },
      {
        endpointId: 'EP-006',
        name: 'Get Customer Vehicles',
        category: 'Vehicles',
        method: 'GET',
        path: '/api/open/v1/vehicles',
        description: 'List all vehicles registered to the authenticated customer',
        requiresAuth: true,
        rateLimit: '100 requests/minute',
      },
      {
        endpointId: 'EP-007',
        name: 'Get Vehicle Details',
        category: 'Vehicles',
        method: 'GET',
        path: '/api/open/v1/vehicles/{vehicleNumber}',
        description: 'Get detailed information for a specific vehicle',
        requiresAuth: true,
        rateLimit: '100 requests/minute',
      },
      {
        endpointId: 'EP-008',
        name: 'Get Vehicle Consumption',
        category: 'Vehicles',
        method: 'GET',
        path: '/api/open/v1/vehicles/{vehicleNumber}/consumption',
        description: 'Retrieve consumption data for a specific vehicle',
        requiresAuth: true,
        rateLimit: '100 requests/minute',
      },
      {
        endpointId: 'EP-009',
        name: 'Get Vehicles by Status',
        category: 'Vehicles',
        method: 'GET',
        path: '/api/open/v1/vehicles/status/{status}',
        description: 'Filter vehicles by status (Active, Suspended, Inactive, Terminated)',
        requiresAuth: true,
        rateLimit: '100 requests/minute',
      },
    ];
  }

  toggleAPIAccess(): void {
    if (this.apiCredential) {
      this.apiEnabled = !this.apiEnabled;
      this.apiCredential.isEnabled = this.apiEnabled;
      // In real implementation, this would save to backend
      this.successMessage = `API access ${this.apiEnabled ? 'enabled' : 'disabled'} successfully`;
      this.showSuccessModal = true;
    }
  }

  // Generate new credentials
  openGenerateModal(): void {
    this.showGenerateModal = true;
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
  }

  confirmGenerate(): void {
    this.generatedCredential = this.csp.generateCustomerAPICredential();
    this.loadAPICredential();
    this.apiEnabled = true;
    this.showGenerateModal = false;
    this.showSecretModal = true; // Show secret only once
  }

  closeSecretModal(): void {
    this.showSecretModal = false;
    this.generatedCredential = null;
  }

  // Regenerate credentials
  openRegenerateModal(): void {
    this.showRegenerateModal = true;
  }

  closeRegenerateModal(): void {
    this.showRegenerateModal = false;
  }

  confirmRegenerate(): void {
    this.generatedCredential = this.csp.regenerateCustomerAPICredential();
    this.loadAPICredential();
    this.showRegenerateModal = false;
    this.showSecretModal = true; // Show new secret only once
  }

  // Revoke credentials
  openRevokeModal(): void {
    this.showRevokeModal = true;
  }

  closeRevokeModal(): void {
    this.showRevokeModal = false;
  }

  confirmRevoke(): void {
    this.csp.revokeCustomerAPICredential();
    this.loadAPICredential();
    this.apiEnabled = false;
    this.showRevokeModal = false;
    this.successMessage = 'API credentials revoked successfully';
    this.showSuccessModal = true;
  }

  // Endpoint details
  openEndpointDetails(endpoint: APIEndpoint): void {
    this.selectedEndpoint = endpoint;
    this.showEndpointModal = true;
  }

  closeEndpointModal(): void {
    this.showEndpointModal = false;
    this.selectedEndpoint = null;
  }

  // Success modal
  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.successMessage = '';
  }

  // Helper methods
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.successMessage = 'Copied to clipboard!';
      this.showSuccessModal = true;
    });
  }

  maskApiKey(key: string): string {
    if (key.length <= 12) return key;
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 8);
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'Active') return 'csp-badge--approved';
    if (status === 'Revoked') return 'csp-badge--rejected';
    if (status === 'Disabled') return 'csp-badge--info';
    return 'csp-badge--info';
  }

  getMethodBadgeClass(method: string): string {
    return method === 'GET' ? 'csp-method-badge--get' : 'csp-method-badge--post';
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'Never';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  getCategoryBadgeClass(category: string): string {
    const classes: Record<string, string> = {
      'Vehicles': 'csp-category-badge--vehicles',
      'Consumption': 'csp-category-badge--consumption',
      'Billing': 'csp-category-badge--billing',
      'Transactions': 'csp-category-badge--transactions',
      'Fleet': 'csp-category-badge--fleet',
    };
    return classes[category] || 'csp-category-badge--default';
  }
}
