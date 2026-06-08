import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ShopsComponent } from './pages/shops/shops.component';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { ChequesComponent } from './pages/cheques/cheques.component';
import { UtilityBillsComponent } from './pages/utility-bills/utility-bills.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { RequestsComponent } from './pages/requests/requests.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { AnnouncementsComponent } from './pages/announcements/announcements.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SalesDashboardComponent } from './pages/sales-dashboard/sales-dashboard.component';
import { SalesDataComponent } from './pages/sales-data/sales-data.component';
import { SalesUploadComponent } from './pages/sales-upload/sales-upload.component';
import { SalesReportsComponent } from './pages/sales-reports/sales-reports.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, title: 'Kenar Dashboard · WOQOD Total Control' },
  { path: 'profile', component: ProfileComponent, title: 'My Profile · Kenar · WOQOD Total Control' },
  { path: 'shops', component: ShopsComponent, title: 'My Shops · Kenar · WOQOD Total Control' },
  { path: 'contracts', component: ContractsComponent, title: 'Contracts · Kenar · WOQOD Total Control' },
  { path: 'invoices', component: InvoicesComponent, title: 'Rent & Invoices · Kenar · WOQOD Total Control' },
  { path: 'cheques', component: ChequesComponent, title: 'Cheque Status · Kenar · WOQOD Total Control' },
  { path: 'utilities', component: UtilityBillsComponent, title: 'Utility Bills · Kenar · WOQOD Total Control' },
  { path: 'payments', component: PaymentsComponent, title: 'Payments & Receipts · Kenar · WOQOD Total Control' },
  { path: 'documents', component: DocumentsComponent, title: 'Documents · Kenar · WOQOD Total Control' },
  { path: 'requests', component: RequestsComponent, title: 'Requests & Complaints · Kenar · WOQOD Total Control' },
  { path: 'notifications', component: NotificationsComponent, title: 'Notifications · Kenar · WOQOD Total Control' },
  { path: 'announcements', component: AnnouncementsComponent, title: 'Announcements · Kenar · WOQOD Total Control' },
  { path: 'reports', component: ReportsComponent, title: 'Reports · Kenar · WOQOD Total Control' },
  { path: 'sales-dashboard', component: SalesDashboardComponent, title: 'Sales Dashboard · Kenar · WOQOD Total Control' },
  { path: 'sales-data', component: SalesDataComponent, title: 'Sales Data Management · Kenar · WOQOD Total Control' },
  { path: 'sales-upload', component: SalesUploadComponent, title: 'Upload Sales Data · Kenar · WOQOD Total Control' },
  { path: 'sales-reports', component: SalesReportsComponent, title: 'Sales Reports · Kenar · WOQOD Total Control' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KenarRoutingModule {}
