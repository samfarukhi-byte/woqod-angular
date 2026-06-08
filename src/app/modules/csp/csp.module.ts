import { NgModule } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { CspRoutingModule } from './csp-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { ProfileComponent } from './pages/profile/profile.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { ReviewChangesComponent } from './pages/review-changes/review-changes.component';
import { TrackRequestsComponent } from './pages/track-requests/track-requests.component';
import { MakerReviewComponent } from './pages/maker-review/maker-review.component';
import { CheckerApprovalComponent } from './pages/checker-approval/checker-approval.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { CompanyProfileSettingsComponent } from './pages/settings/company-profile-settings/company-profile-settings.component';
import { UserAccessSettingsComponent } from './pages/settings/user-access-settings/user-access-settings.component';
import { ApprovalFlowSettingsComponent } from './pages/settings/approval-flow-settings/approval-flow-settings.component';
import { ConfigurationsComponent } from './pages/settings/configurations/configurations.component';
import { ApiIntegrationSettingsComponent } from './pages/settings/api-integration-settings/api-integration-settings.component';
import { SecurityComplianceSettingsComponent } from './pages/settings/security-compliance-settings/security-compliance-settings.component';
import { NotificationSettingsComponent } from './pages/settings/notification-settings/notification-settings.component';
import { SystemPreferencesSettingsComponent } from './pages/settings/system-preferences-settings/system-preferences-settings.component';

import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { DiffTableComponent } from './components/diff-table/diff-table.component';
import { DocumentCardComponent } from './components/document-card/document-card.component';
import { RequestCardComponent } from './components/request-card/request-card.component';
import { RequestModalComponent } from './components/request-modal/request-modal.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';

// Home page and related components
import { HomeComponent } from './pages/home/home.component';
import { NewsComponent } from './pages/news/news.component';
import { TendersComponent } from './pages/tenders/tenders.component';
import { ServicesComponent } from './pages/services/services.component';

// Service dashboards
import { RetailDashboardComponent } from './pages/service-dashboards/retail-dashboard/retail-dashboard.component';
import { RetailSectionComponent } from './pages/service-dashboards/retail-section/retail-section.component';
import { VoucherManagementComponent } from './pages/service-dashboards/voucher-management/voucher-management.component';
import { ServiceHubComponent } from './pages/service-dashboards/service-hub/service-hub.component';
import { BulkFuelDashboardComponent } from './pages/service-dashboards/bulk-fuel-dashboard/bulk-fuel-dashboard.component';
import { BulkFuelRegisterComponent } from './pages/service-dashboards/bulk-fuel-register/bulk-fuel-register.component';
import { BulkFuelAmendComponent } from './pages/service-dashboards/bulk-fuel-amend/bulk-fuel-amend.component';
import { BulkFuelTerminateComponent } from './pages/service-dashboards/bulk-fuel-terminate/bulk-fuel-terminate.component';
import { BulkFuelInvoicesComponent } from './pages/service-dashboards/bulk-fuel-invoices/bulk-fuel-invoices.component';
import { BulkFuelInspectionComponent } from './pages/service-dashboards/bulk-fuel-inspection/bulk-fuel-inspection.component';
import { AviationDashboardComponent } from './pages/service-dashboards/aviation-dashboard/aviation-dashboard.component';
import { BunkeringDashboardComponent } from './pages/service-dashboards/bunkering-dashboard/bunkering-dashboard.component';
import { BitumenDashboardComponent } from './pages/service-dashboards/bitumen-dashboard/bitumen-dashboard.component';
import { FahesDashboardComponent } from './pages/service-dashboards/fahes-dashboard/fahes-dashboard.component';
import { BulkGasDashboardComponent } from './pages/service-dashboards/bulk-gas-dashboard/bulk-gas-dashboard.component';
import { ShafafDashboardComponent } from './pages/service-dashboards/shafaf-dashboard/shafaf-dashboard.component';
import { TenderDetailsComponent } from './pages/tender-details/tender-details.component';

@NgModule({
  declarations: [
    ProfileComponent,
    EditProfileComponent,
    DocumentsComponent,
    ReviewChangesComponent,
    TrackRequestsComponent,
    MakerReviewComponent,
    CheckerApprovalComponent,
    SettingsComponent,
    CompanyProfileSettingsComponent,
    UserAccessSettingsComponent,
    ApprovalFlowSettingsComponent,
    ConfigurationsComponent,
    ApiIntegrationSettingsComponent,
    SecurityComplianceSettingsComponent,
    NotificationSettingsComponent,
    SystemPreferencesSettingsComponent,
    StatusBadgeComponent,
    DiffTableComponent,
    DocumentCardComponent,
    RequestCardComponent,
    RequestModalComponent,
    NotificationsComponent,
    // Home page and related
    HomeComponent,
    NewsComponent,
    TendersComponent,
    ServicesComponent,
    // Service dashboards
    RetailDashboardComponent,
    RetailSectionComponent,
    VoucherManagementComponent,
    ServiceHubComponent,
    BulkFuelDashboardComponent,
    BulkFuelRegisterComponent,
    BulkFuelAmendComponent,
    BulkFuelTerminateComponent,
    BulkFuelInvoicesComponent,
    BulkFuelInspectionComponent,
    AviationDashboardComponent,
    BunkeringDashboardComponent,
    BitumenDashboardComponent,
    FahesDashboardComponent,
    BulkGasDashboardComponent,
    ShafafDashboardComponent,
    TenderDetailsComponent,
  ],
  imports: [SharedModule, CspRoutingModule, QRCodeModule],
})
export class CspModule {}
