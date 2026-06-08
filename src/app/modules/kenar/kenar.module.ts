import { NgModule } from '@angular/core';
import { KenarRoutingModule } from './kenar-routing.module';
import { SharedModule } from '../../shared/shared.module';

// Pages
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

// Components
import { ShopDetailModalComponent } from './components/shop-detail-modal/shop-detail-modal.component';
import { ContractDetailModalComponent } from './components/contract-detail-modal/contract-detail-modal.component';
import { SubmitRequestModalComponent } from './components/submit-request-modal/submit-request-modal.component';
import { UploadDocumentModalComponent } from './components/upload-document-modal/upload-document-modal.component';

@NgModule({
  declarations: [
    // Pages
    DashboardComponent,
    ProfileComponent,
    ShopsComponent,
    ContractsComponent,
    InvoicesComponent,
    ChequesComponent,
    UtilityBillsComponent,
    PaymentsComponent,
    DocumentsComponent,
    RequestsComponent,
    NotificationsComponent,
    AnnouncementsComponent,
    ReportsComponent,
    SalesDashboardComponent,
    SalesDataComponent,
    SalesUploadComponent,
    SalesReportsComponent,
    // Components
    ShopDetailModalComponent,
    ContractDetailModalComponent,
    SubmitRequestModalComponent,
    UploadDocumentModalComponent,
  ],
  imports: [SharedModule, KenarRoutingModule],
})
export class KenarModule {}

