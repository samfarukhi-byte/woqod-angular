import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BulkFuelContract, BulkFuelInvoice, BulkFuelService } from '../../../../../core/services/bulk-fuel.service';

@Component({
  selector: 'app-bulk-fuel-invoices',
  templateUrl: './bulk-fuel-invoices.component.html',
  styleUrls: ['./bulk-fuel-invoices.component.scss'],
})
export class BulkFuelInvoicesComponent implements OnInit {
  activeTab: 'invoices' | 'report' = 'invoices';

  contracts: BulkFuelContract[] = [];
  invoices: BulkFuelInvoice[] = [];

  filterContract = '';
  filterStatus = '';

  // Invoice detail
  selectedInvoice: BulkFuelInvoice | null = null;

  constructor(private readonly router: Router, private readonly bf: BulkFuelService) {}

  ngOnInit(): void {
    this.contracts = this.bf.getContracts();
    this.invoices = this.bf.getInvoices();
  }

  setTab(t: 'invoices' | 'report'): void { this.activeTab = t; }

  get filteredInvoices(): BulkFuelInvoice[] {
    return this.invoices.filter((i) =>
      (!this.filterContract || i.contractNo === this.filterContract) &&
      (!this.filterStatus || i.status === this.filterStatus));
  }

  get totalAmount(): number { return this.filteredInvoices.reduce((s, i) => s + i.amount, 0); }
  get pendingCount(): number { return this.invoices.filter((i) => i.status !== 'Paid').length; }

  clearFilters(): void { this.filterContract = ''; this.filterStatus = ''; }

  // ----- Invoice detail -----------------------------------------------------
  openInvoice(inv: BulkFuelInvoice): void { this.selectedInvoice = inv; }
  closeInvoice(): void { this.selectedInvoice = null; }

  contractFor(inv: BulkFuelInvoice | null) {
    return inv ? this.bf.getContract(inv.contractNo) : undefined;
  }

  /** Related delivery transactions that make up an invoice (mock breakdown). */
  invoiceLines(inv: BulkFuelInvoice | null): { ref: string; date: string; qty: number; rate: number; amount: number }[] {
    if (!inv) return [];
    const rate = +(inv.amount / (inv.volume || 1)).toFixed(2);
    const n = 4;
    const per = Math.floor(inv.volume / n);
    const issued = new Date(inv.issuedDate);
    const lines = [];
    for (let i = 0; i < n; i++) {
      const qty = i === n - 1 ? inv.volume - per * (n - 1) : per;
      const d = new Date(issued);
      d.setDate(d.getDate() - (n - i) * 7);
      lines.push({
        ref: `DLV-${inv.invoiceNo.slice(-4)}-${i + 1}`,
        date: d.toISOString().slice(0, 10),
        qty,
        rate,
        amount: Math.round(qty * rate),
      });
    }
    return lines;
  }

  invoiceSubtotal(inv: BulkFuelInvoice | null): number {
    return this.invoiceLines(inv).reduce((s, l) => s + l.amount, 0);
  }

  dueDate(inv: BulkFuelInvoice | null): string {
    if (!inv) return '';
    const d = new Date(inv.issuedDate);
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }

  /** Open a clean, branded printable view of the invoice and trigger print. */
  printInvoice(inv: BulkFuelInvoice | null): void {
    if (!inv) return;
    const c = this.contractFor(inv);
    const lines = this.invoiceLines(inv);
    const rows = lines.map((l) =>
      `<tr><td>${l.ref}</td><td>${l.date}</td><td style="text-align:right">${l.qty.toLocaleString()}</td>
       <td style="text-align:right">${l.rate.toFixed(2)}</td><td style="text-align:right">${l.amount.toLocaleString()}</td></tr>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${inv.invoiceNo}</title>
      <style>
        body{font-family:'Poppins',Arial,sans-serif;color:#020618;padding:40px;max-width:780px;margin:auto;}
        .hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #009a33;padding-bottom:16px;margin-bottom:24px;}
        .brand{font-size:24px;font-weight:800;color:#009a33;} .brand small{display:block;color:#62748e;font-size:12px;font-weight:500;}
        h1{font-size:20px;margin:0 0 4px;} .muted{color:#62748e;font-size:13px;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin:20px 0;font-size:13px;}
        .grid div b{color:#45556c;}
        table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px;}
        th,td{border:1px solid #e2e8f0;padding:8px 10px;} th{background:#f1f5f9;text-align:left;}
        .tot{margin-top:16px;width:100%;display:flex;justify-content:flex-end;}
        .tot table{width:280px;} .tot td{border:none;padding:4px 0;} .tot .g{font-weight:800;font-size:16px;color:#009a33;border-top:2px solid #e2e8f0;padding-top:8px;}
        .badge{display:inline-block;padding:3px 10px;border-radius:9999px;background:#e8f6ee;color:#00802b;font-weight:700;font-size:12px;}
      </style></head><body>
      <div class="hd"><div class="brand">WOQOD<small>Qatar Fuel — Total Control</small></div>
        <div style="text-align:right"><h1>TAX INVOICE</h1><div class="muted">${inv.invoiceNo}</div><div class="badge">${inv.status}</div></div></div>
      <div class="grid">
        <div><b>Customer:</b> ${c?.customerName ?? '—'}</div><div><b>Contract:</b> ${inv.contractNo}</div>
        <div><b>Product:</b> ${inv.product}</div><div><b>Site:</b> ${c?.site ?? '—'}</div>
        <div><b>Billing Period:</b> ${inv.period}</div><div><b>Issued:</b> ${inv.issuedDate}</div>
        <div><b>Due Date:</b> ${this.dueDate(inv)}</div><div><b>Total Volume:</b> ${inv.volume.toLocaleString()} L</div>
      </div>
      <table><thead><tr><th>Delivery Ref</th><th>Date</th><th style="text-align:right">Qty (L)</th><th style="text-align:right">Rate (QAR)</th><th style="text-align:right">Amount (QAR)</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="tot"><table>
        <tr><td>Subtotal</td><td style="text-align:right">QAR ${this.invoiceSubtotal(inv).toLocaleString()}</td></tr>
        <tr><td>VAT (0%)</td><td style="text-align:right">QAR 0</td></tr>
        <tr><td class="g">Total Due</td><td class="g" style="text-align:right">QAR ${inv.amount.toLocaleString()}</td></tr>
      </table></div>
      <p class="muted" style="margin-top:32px">This is a system-generated invoice from WOQOD Total Control. For queries call 16007 or email customercare@woqod.com.qa.</p>
      </body></html>`;
    const w = window.open('', '_blank', 'width=820,height=900');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  statusClass(status: string): string {
    if (status === 'Paid' || status === 'Active') return 'csp-badge--approved';
    if (status === 'Overdue' || status === 'Terminated') return 'csp-badge--rejected';
    if (status === 'Finished') return 'csp-badge--neutral';
    return 'csp-badge--pending';
  }

  // ----- Downloads (real CSV blobs) ----------------------------------------
  downloadInvoice(inv: BulkFuelInvoice): void {
    const rows = [
      ['Invoice No', inv.invoiceNo],
      ['Contract No', inv.contractNo],
      ['Product', inv.product],
      ['Period', inv.period],
      ['Volume (L)', String(inv.volume)],
      ['Amount (QAR)', String(inv.amount)],
      ['Issued Date', inv.issuedDate],
      ['Status', inv.status],
    ];
    this.downloadCsv(`${inv.invoiceNo}.csv`, rows.map((r) => r.join(',')).join('\n'));
  }

  downloadInvoicesReport(): void {
    const header = ['Invoice No', 'Contract No', 'Product', 'Period', 'Volume (L)', 'Amount (QAR)', 'Issued', 'Status'];
    const lines = [header.join(',')];
    this.filteredInvoices.forEach((i) =>
      lines.push([i.invoiceNo, i.contractNo, i.product, i.period, i.volume, i.amount, i.issuedDate, i.status].join(',')));
    this.downloadCsv('bulk-fuel-invoices.csv', lines.join('\n'));
  }

  downloadContractReport(): void {
    const header = ['Contract No', 'Customer', 'Product', 'Site', 'Min (L)', 'Max (L)', 'Approved Qty (L)', 'Start', 'End', 'Status'];
    const lines = [header.join(',')];
    this.contracts.forEach((c) =>
      lines.push([c.contractNo, c.customerName, c.product, c.site, c.minVolume, c.maxVolume, c.approvedQuantity, c.startDate, c.endDate, c.status].join(',')));
    this.downloadCsv('bulk-fuel-contract-status.csv', lines.join('\n'));
  }

  private downloadCsv(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  backToBulkFuel(): void { this.router.navigate(['/csp/services/bulk-fuel/dashboard']); }
}
