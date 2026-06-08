import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { NotFoundComponent } from '../../shared/components/not-found/not-found.component';
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
import { SystemPreferencesSettingsComponent } from './pages/settings/system-preferences-settings/system-preferences-settings.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { HomeComponent } from './pages/home/home.component';
import { NewsComponent } from './pages/news/news.component';
import { TendersComponent } from './pages/tenders/tenders.component';
import { TenderDetailsComponent } from './pages/tender-details/tender-details.component';
import { ServicesComponent } from './pages/services/services.component';
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

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, title: 'Home · WOQOD Total Control' },
  { path: 'news', component: NewsComponent, title: 'News · WOQOD Total Control' },
  { path: 'tenders', component: TendersComponent, title: 'Tenders · WOQOD Total Control' },
  { path: 'tenders/:id', component: TenderDetailsComponent, title: 'Tender Details · WOQOD Total Control' },
  { path: 'services', component: ServicesComponent, title: 'Services · WOQOD Total Control' },
  { path: 'services/:code', component: ServiceHubComponent, title: 'Service · WOQOD Total Control' },

  // Service Dashboards
  { path: 'services/retail/dashboard', component: RetailDashboardComponent, title: 'Retail · WOQOD Total Control' },
  { path: 'services/retail/vouchers', component: VoucherManagementComponent, title: 'Voucher Management · WOQOD Total Control' },
  { path: 'services/retail/:section', component: RetailSectionComponent, title: 'Retail Service · WOQOD Total Control' },
  { path: 'services/bulk-fuel/dashboard', component: BulkFuelDashboardComponent, title: 'Bulk Fuel · WOQOD Total Control' },
  { path: 'services/bulk-fuel/register', component: BulkFuelRegisterComponent, title: 'Bulk Fuel Registration · WOQOD Total Control' },
  { path: 'services/bulk-fuel/amend', component: BulkFuelAmendComponent, title: 'Amend Bulk Fuel Contract · WOQOD Total Control' },
  { path: 'services/bulk-fuel/terminate', component: BulkFuelTerminateComponent, title: 'Terminate Bulk Fuel Contract · WOQOD Total Control' },
  { path: 'services/bulk-fuel/invoices', component: BulkFuelInvoicesComponent, title: 'Bulk Fuel Invoices & Reports · WOQOD Total Control' },
  { path: 'services/bulk-fuel/inspection', component: BulkFuelInspectionComponent, title: 'Bulk Fuel Periodic Inspection · WOQOD Total Control' },
  { path: 'services/aviation/dashboard', component: AviationDashboardComponent, title: 'Aviation · WOQOD Total Control' },
  { path: 'services/bunkering/dashboard', component: BunkeringDashboardComponent, title: 'Bunkering · WOQOD Total Control' },
  { path: 'services/bitumen/dashboard', component: BitumenDashboardComponent, title: 'Bitumen · WOQOD Total Control' },
  { path: 'services/fahes/dashboard', component: FahesDashboardComponent, title: 'Fahes · WOQOD Total Control' },
  { path: 'services/bulk-gas/dashboard', component: BulkGasDashboardComponent, title: 'Bulk Gas · WOQOD Total Control' },
  { path: 'services/shafaf/dashboard', component: ShafafDashboardComponent, title: 'SHAFAF · WOQOD Total Control' },

  { path: 'profile', component: ProfileComponent, title: 'My Profile · WOQOD Total Control' },
  { path: 'edit-profile', component: EditProfileComponent, title: 'Edit Profile · WOQOD Total Control' },
  { path: 'documents', component: DocumentsComponent, title: 'Documents · WOQOD Total Control' },
  { path: 'review-changes', component: ReviewChangesComponent, title: 'Review & Submit · WOQOD Total Control' },
  { path: 'track-requests', component: TrackRequestsComponent, title: 'Track Requests · WOQOD Total Control' },
  { path: 'notifications', component: NotificationsComponent, title: 'Notifications · WOQOD Total Control' },
  { path: 'maker-review', component: MakerReviewComponent, canActivate: [RoleGuard], data: { roles: ['Maker', 'Admin'] }, title: 'Maker Review · WOQOD Total Control' },
  { path: 'checker-approval', component: CheckerApprovalComponent, canActivate: [RoleGuard], data: { roles: ['Checker', 'Admin'] }, title: 'Checker Approval · WOQOD Total Control' },
  {
    path: 'settings',
    component: SettingsComponent,
    title: 'Settings · WOQOD Total Control',
    children: [
      { path: '', redirectTo: 'company-profile', pathMatch: 'full' },
      { path: 'company-profile', component: CompanyProfileSettingsComponent, title: 'Company Profile · Settings · WOQOD Total Control' },
      { path: 'user-access', component: UserAccessSettingsComponent, title: 'User & Access · Settings · WOQOD Total Control' },
      { path: 'approval-flows', component: ApprovalFlowSettingsComponent, title: 'Approval Flows · Settings · WOQOD Total Control' },
      { path: 'configurations', component: ConfigurationsComponent, title: 'Configurations · Settings · WOQOD Total Control' },
      { path: 'api-integration', component: ApiIntegrationSettingsComponent, title: 'API Integration · Settings · WOQOD Total Control' },
      { path: 'security', component: SecurityComplianceSettingsComponent, title: 'Security & Compliance · Settings · WOQOD Total Control' },
      { path: 'system', component: SystemPreferencesSettingsComponent, title: 'System Preferences · Settings · WOQOD Total Control' },
    ],
  },
  { path: '**', component: NotFoundComponent, title: 'Not Found · WOQOD Total Control' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CspRoutingModule {}
