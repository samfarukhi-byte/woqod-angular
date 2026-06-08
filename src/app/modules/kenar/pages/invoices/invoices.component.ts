import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Payment, RentInvoice, Shop } from '../../../../models/kenar.model';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
})
export class InvoicesComponent implements OnInit, OnDestroy {
  invoices: RentInvoice[] = [];
  filteredInvoices: RentInvoice[] = [];
  shops: Shop[] = [];

  filterShop: string = '';
  filterMonth: string = '';
  filterYear: string = '';
  filterStatus: string = '';

  months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  years: string[] = [];

  // Invoice detail
  selectedInvoice: RentInvoice | null = null;

  private sub = new Subscription();

  constructor(
    private readonly kenarService: KenarService,
    private readonly toast: ToastService,
  ) {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.years.push(i.toString());
    }
  }

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.invoices$.subscribe((invoices) => {
        this.invoices = invoices;
        this.applyFilters();
      })
    );

    this.sub.add(
      this.kenarService.shops$.subscribe((shops) => {
        this.shops = shops;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  applyFilters(): void {
    this.filteredInvoices = this.invoices.filter((invoice) => {
      const matchesShop = !this.filterShop || invoice.shopCode === this.filterShop;
      const matchesStatus = !this.filterStatus || invoice.paymentStatus === this.filterStatus;

      let matchesPeriod = true;
      if (this.filterMonth || this.filterYear) {
        const period = invoice.billingPeriod;
        if (this.filterMonth) {
          matchesPeriod = period.includes(`-${this.filterMonth}-`) || period.includes(`/${this.filterMonth}/`);
        }
        if (this.filterYear) {
          matchesPeriod = matchesPeriod && period.includes(this.filterYear);
        }
      }

      return matchesShop && matchesStatus && matchesPeriod;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterShop = '';
    this.filterMonth = '';
    this.filterYear = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      Paid: 'woqod-badge-success',
      'Partially Paid': 'woqod-badge-info',
      Pending: 'woqod-badge-warning',
      Overdue: 'woqod-badge-danger',
    };
    return map[status] || 'woqod-badge-secondary';
  }

  // ----- Invoice detail -----------------------------------------------------
  viewInvoice(invoice: RentInvoice): void { this.selectedInvoice = invoice; }
  closeInvoice(): void { this.selectedInvoice = null; }

  shopName(code: string): string {
    const s = this.shops.find((x) => x.shopCode === code);
    return s ? `${s.shopCode} — ${s.stationName}` : code;
  }

  /** Payments applied to this invoice (related transactions). */
  relatedPayments(inv: RentInvoice | null): Payment[] {
    if (!inv) return [];
    return this.kenarService.getPayments().filter((p) => p.invoiceAdjusted === inv.invoiceNumber);
  }

  downloadInvoice(invoice: RentInvoice): void {
    const rows = [
      ['Invoice Number', invoice.invoiceNumber],
      ['Shop', this.shopName(invoice.shopCode)],
      ['Contract Reference', invoice.contractReference],
      ['Billing Period', invoice.billingPeriod],
      ['Issue Date', invoice.issueDate],
      ['Due Date', invoice.dueDate],
      ['Rent Amount (QAR)', String(invoice.rentAmount)],
      ['Paid Amount (QAR)', String(invoice.paidAmount)],
      ['Outstanding (QAR)', String(invoice.outstandingAmount)],
      ['Status', invoice.paymentStatus],
    ];
    this.downloadCsv(`${invoice.invoiceNumber}.csv`, rows.map((r) => r.join(',')).join('\n'));
  }

  private downloadCsv(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success(`Invoice ${filename} downloaded.`);
  }

  printInvoice(inv: RentInvoice | null): void {
    if (!inv) return;
    const pays = this.relatedPayments(inv);
    const rows = pays.length
      ? pays.map((p) =>
          `<tr><td>${p.receiptNumber}</td><td>${p.paymentDate}</td><td>${p.paymentMode}</td>
           <td style="text-align:right">${p.amountPaid.toLocaleString()}</td><td>${p.paymentStatus}</td></tr>`).join('')
      : `<tr><td colspan="5" style="text-align:center;color:#64748b">No payments recorded yet</td></tr>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${inv.invoiceNumber}</title>
      <style>
        body{font-family:'Poppins',Arial,sans-serif;color:#020618;padding:40px;max-width:780px;margin:auto;}
        .hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #009a33;padding-bottom:16px;margin-bottom:24px;}
        .brand{font-size:24px;font-weight:800;color:#009a33;} .brand small{display:block;color:#62748e;font-size:12px;font-weight:500;}
        h1{font-size:20px;margin:0 0 4px;} .muted{color:#62748e;font-size:13px;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin:20px 0;font-size:13px;} .grid b{color:#45556c;}
        table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px;} th,td{border:1px solid #e2e8f0;padding:8px 10px;} th{background:#f1f5f9;text-align:left;}
        .tot{margin-top:16px;display:flex;justify-content:flex-end;} .tot table{width:300px;} .tot td{border:none;padding:4px 0;}
        .g{font-weight:800;font-size:16px;color:#009a33;border-top:2px solid #e2e8f0;padding-top:8px;}
        .badge{display:inline-block;padding:3px 10px;border-radius:9999px;background:#e8f6ee;color:#00802b;font-weight:700;font-size:12px;}
      </style></head><body>
      <div class="hd"><div class="brand">WOQOD<small>Kenar — Rental Shops</small></div>
        <div style="text-align:right"><h1>RENT INVOICE</h1><div class="muted">${inv.invoiceNumber}</div><div class="badge">${inv.paymentStatus}</div></div></div>
      <div class="grid">
        <div><b>Shop:</b> ${this.shopName(inv.shopCode)}</div><div><b>Contract:</b> ${inv.contractReference}</div>
        <div><b>Billing Period:</b> ${inv.billingPeriod}</div><div><b>Issued:</b> ${inv.issueDate}</div>
        <div><b>Due Date:</b> ${inv.dueDate}</div><div><b>Status:</b> ${inv.paymentStatus}</div>
      </div>
      <h3 style="font-size:14px;margin:16px 0 4px">Payments / Related Transactions</h3>
      <table><thead><tr><th>Receipt</th><th>Date</th><th>Mode</th><th style="text-align:right">Amount (QAR)</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="tot"><table>
        <tr><td>Rent Amount</td><td style="text-align:right">QAR ${inv.rentAmount.toLocaleString()}</td></tr>
        <tr><td>Paid</td><td style="text-align:right">QAR ${inv.paidAmount.toLocaleString()}</td></tr>
        <tr><td class="g">Outstanding</td><td class="g" style="text-align:right">QAR ${inv.outstandingAmount.toLocaleString()}</td></tr>
      </table></div>
      <p class="muted" style="margin-top:32px">System-generated by WOQOD Total Control · Kenar. Queries: 16007 · customercare@woqod.com.qa</p>
      </body></html>`;
    const w = window.open('', '_blank', 'width=820,height=900');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }
}
