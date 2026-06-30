import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from './services/customer.service';
import { CarService } from './services/car.service';
import { PaintService } from './services/paint.service';
import { AuthService } from './services/auth.service';
import { Customer } from './models/customer';
import { Car } from './models/car';
import { PaintOrder } from './models/paint';
import { PaintColor } from './models/paint';
import { Payment } from './models/payment';
import { PaymentService } from './services/payment.service';
import { CarsPage } from './pages/cars/cars-page';
import { CustomersPage } from './pages/customers/customers-page';
import { DashboardPage } from './pages/dashboard/dashboard-page';
import { LoginPage } from './pages/login/login-page';
import { PaintOrdersPage } from './pages/paint-orders/paint-orders-page';
import { ColorsPage } from './pages/colors/colors-page';
import { PaymentsPage } from './pages/payments/payments-page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CarsPage, CustomersPage, DashboardPage, LoginPage,
    PaintOrdersPage, ColorsPage, PaymentsPage
  ],
  templateUrl: './app.html',
  styleUrl: '../styles.css'
})
export class App implements OnInit {
  activeTab = signal<'dashboard' | 'customers' | 'cars' | 'orders' | 'colors' | 'payments'>('dashboard');

  customers = signal<Customer[]>([]);
  cars = signal<Car[]>([]);
  orders = signal<PaintOrder[]>([]);
  colors = signal<PaintColor[]>([]);
  payments = signal<Payment[]>([]);

  authError = signal<string>('');
  authLoading = signal<boolean>(false);

  constructor(
    private customerService: CustomerService,
    private carService: CarService,
    private paintService: PaintService,
    private paymentService: PaymentService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.fetchData();
  }

  setTab(tab: string) {
    this.activeTab.set(tab as any);
    this.fetchData();
  }

  fetchData() {
    this.customerService.getCustomers().subscribe(res => this.customers.set(res));
    this.carService.getCars().subscribe(res => this.cars.set(res));
    this.paintService.getOrders().subscribe(res => this.orders.set(res));
    this.paintService.getColors().subscribe(res => this.colors.set(res));
    this.paymentService.getPayments().subscribe(res => this.payments.set(res));
  }

  // --- Auth ---
  handleLogin(creds: { emailOrUsername: string; password: string }) {
    this.authError.set('');
    this.authLoading.set(true);
    this.authService.login(creds).subscribe({
      next: () => this.authLoading.set(false),
      error: (err) => {
        this.authLoading.set(false);
        this.authError.set(err.error?.message || 'Login failed');
      }
    });
  }

  handleRegister(data: { name: string; email: string; username: string; password: string }) {
    this.authError.set('');
    this.authLoading.set(true);
    this.authService.register(data).subscribe({
      next: () => this.authLoading.set(false),
      error: (err) => {
        this.authLoading.set(false);
        this.authError.set(err.error?.message || 'Registration failed');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.activeTab.set('dashboard');
  }

  // --- Car Handlers ---
  handleAddCar(car: Car) {
    this.carService.createCar(car).subscribe(() => this.fetchData());
  }

  handleEditCar(car: Car) {
    this.carService.updateCar(car._id!, car).subscribe(() => this.fetchData());
  }

  handleDeleteCar(id: string) {
    this.carService.deleteCar(id).subscribe(() => this.fetchData());
  }

  // --- Customer Handlers ---
  handleAddCustomer(c: Customer) {
    this.customerService.createCustomer(c).subscribe(() => this.fetchData());
  }

  handleEditCustomer(c: Customer) {
    this.customerService.updateCustomer(c._id!, c).subscribe(() => this.fetchData());
  }

  handleDeleteCustomer(id: string) {
    this.customerService.deleteCustomer(id).subscribe(() => this.fetchData());
  }

  // --- Order Handlers ---
  handleAddOrder(order: PaintOrder) {
    this.paintService.createOrder(order).subscribe(() => this.fetchData());
  }

  handleUpdateStatus(event: { order: PaintOrder; status: PaintOrder['status'] }) {
    if (event.order.status === event.status) return;
    this.paintService.updateOrder(event.order._id!, { ...event.order, status: event.status }).subscribe(() => this.fetchData());
  }

  handleDeleteOrder(id: string) {
    this.paintService.deleteOrder(id).subscribe(() => this.fetchData());
  }

  handleGenerateInvoice(order: PaintOrder) {
    const customerName = this.getCustomerName(order.customerId);
    const carDetails = this.getCarDetails(order.carId);
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    const statusColor = order.status === 'Completed' ? '#16a34a' : order.status === 'Painting' ? '#2563eb' : '#d97706';

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Invoice ${invoiceNo}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;color:#1e293b;padding:40px 20px;}
.page{max-width:720px;margin:auto;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.12);overflow:hidden;}
.header{background:linear-gradient(135deg,#1e40af,#6d28d9);padding:40px 40px 32px;color:#fff;}
.logo{font-size:2rem;font-weight:800;letter-spacing:-1px;margin-bottom:4px;}
.logo span{color:#a5f3fc;}
.tagline{font-size:.85rem;opacity:.8;margin-bottom:24px;}
.invoice-meta{display:flex;justify-content:space-between;align-items:flex-end;}
.inv-title{font-size:1.5rem;font-weight:700;opacity:.95;}
.inv-num{font-size:.9rem;opacity:.7;margin-top:2px;}
.inv-date{text-align:right;font-size:.85rem;opacity:.75;}
.badge{display:inline-block;padding:4px 14px;border-radius:999px;font-size:.78rem;font-weight:700;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);margin-top:6px;}
.body{padding:36px 40px;}
.section{margin-bottom:28px;}
.section-title{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e2e8f0;}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.info-item label{font-size:.75rem;color:#94a3b8;font-weight:600;display:block;margin-bottom:2px;}
.info-item p{font-size:.95rem;font-weight:600;color:#1e293b;}
table{width:100%;border-collapse:collapse;margin-top:8px;}
th{background:#f8fafc;padding:10px 14px;text-align:left;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;border-bottom:2px solid #e2e8f0;}
td{padding:14px;font-size:.9rem;border-bottom:1px solid #f1f5f9;}
.amount-row td{font-weight:700;font-size:1rem;}
.total-box{background:linear-gradient(135deg,#1e40af,#6d28d9);border-radius:10px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;color:#fff;margin-top:24px;}
.total-label{font-size:.85rem;opacity:.8;}
.total-amount{font-size:2rem;font-weight:800;}
.footer{background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;}
.footer p{font-size:.8rem;color:#94a3b8;line-height:1.8;}
.status-pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:.78rem;font-weight:700;color:#fff;background:${statusColor};}
@media print{body{background:#fff;padding:0;}.page{box-shadow:none;border-radius:0;}}
</style></head>
<body><div class="page">
<div class="header">
<div class="logo">Auto<span>Garage</span></div>
<div class="tagline">Professional Auto Paint & Repair Services</div>
<div class="invoice-meta">
<div><div class="inv-title">INVOICE</div><div class="inv-num">#${invoiceNo}</div><div class="badge">${order.status}</div></div>
<div class="inv-date"><div>Date Issued</div><div style="font-size:1rem;font-weight:600;margin-top:2px;">${date}</div></div>
</div></div>
<div class="body">
<div class="section"><div class="section-title">Customer & Vehicle Information</div>
<div class="info-grid">
<div class="info-item"><label>Customer Name</label><p>${customerName}</p></div>
<div class="info-item"><label>Vehicle</label><p>${carDetails}</p></div>
<div class="info-item"><label>Task Status</label><p><span class="status-pill">${order.status}</span></p></div>
<div class="info-item"><label>Report Generated</label><p>${date}</p></div>
</div></div>
<div class="section"><div class="section-title">Job Details</div>
<table><thead><tr><th>Description</th><th>Type</th><th>Notes</th><th style="text-align:right;">Price</th></tr></thead>
<tbody><tr class="amount-row"><td>${order.paintType} Paint Job</td><td>${order.paintType}</td><td>${order.note || '—'}</td><td style="text-align:right;">$${(order.price || 0).toFixed(2)}</td></tr></tbody></table>
</div>
<div class="total-box"><div><div class="total-label">TOTAL AMOUNT DUE</div><div style="font-size:.78rem;opacity:.65;margin-top:2px;">Inclusive of all charges</div></div><div class="total-amount">$${(order.price || 0).toFixed(2)}</div></div>
</div>
<div class="footer"><p>Thank you for choosing <strong>AutoGarage</strong>! We appreciate your business.<br>For any queries, please contact us at support@autogarage.com</p></div>
</div></body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoiceNo}_${customerName.replace(/\s+/g, '_')}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  handleGenerateReport(range: { from: string; to: string }) {
    const allOrders = this.orders();
    const customers = this.customers();
    const cars = this.cars();
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const from = range.from ? new Date(range.from + 'T00:00:00') : null;
    const to = range.to ? new Date(range.to + 'T23:59:59') : null;

    const orders = allOrders.filter(o => {
      if (!from && !to) return true;
      const created = (o as any).createdAt ? new Date((o as any).createdAt) : null;
      if (!created) return true;
      if (from && created < from) return false;
      if (to && created > to) return false;
      return true;
    });

    const totalRevenue = orders.reduce((s, o) => s + (o.price || 0), 0);
    const pending = orders.filter(o => o.status === 'Pending').length;
    const painting = orders.filter(o => o.status === 'Painting').length;
    const completed = orders.filter(o => o.status === 'Completed').length;
    const completedRev = orders.filter(o => o.status === 'Completed').reduce((s, o) => s + (o.price || 0), 0);
    const periodLabel = from || to
      ? `${from ? from.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Beginning'} — ${to ? to.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Today'}`
      : 'All Time';

    const statusBg: Record<string, string> = { Pending: '#fef3c7', Painting: '#dbeafe', Completed: '#dcfce7' };
    const statusTxt: Record<string, string> = { Pending: '#92400e', Painting: '#1e40af', Completed: '#166534' };

    const byMonth: Record<string, { count: number; revenue: number }> = {};
    orders.forEach(o => {
      const d = (o as any).createdAt ? new Date((o as any).createdAt) : now;
      const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!byMonth[key]) byMonth[key] = { count: 0, revenue: 0 };
      byMonth[key].count++;
      byMonth[key].revenue += (o.price || 0);
    });
    const monthRows = Object.entries(byMonth).map(([k, v]) =>
      `<tr><td><strong>${k}</strong></td><td>${v.count} orders</td><td style="text-align:right;font-weight:700;">\\$${v.revenue.toFixed(2)}</td></tr>`
    ).join('');

    const rows = orders.map(o => {
      const created = (o as any).createdAt
        ? new Date((o as any).createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'N/A';
      return `<tr>
<td><strong>${o.paintType}</strong> Paint</td>
<td>${this.getCustomerName(o.customerId)}</td>
<td>${this.getCarDetails(o.carId)}</td>
<td style="color:#64748b;">${created}</td>
<td><span style="background:${statusBg[o.status] || '#f3f4f6'};color:${statusTxt[o.status] || '#374151'};padding:3px 10px;border-radius:999px;font-size:.75rem;font-weight:700;">${o.status}</span></td>
<td style="text-align:right;font-weight:700;">\\$${(o.price || 0).toFixed(2)}</td>
</tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Business Report - AutoGarage ${periodLabel}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;color:#1e293b;padding:40px 20px;}
.page{max-width:960px;margin:auto;}
.report-header{background:linear-gradient(135deg,#0f172a,#1e40af);border-radius:14px;padding:40px;color:#fff;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-start;gap:24px;}
.report-header h1{font-size:1.8rem;font-weight:800;margin-bottom:8px;}
.report-header p{opacity:.7;font-size:.85rem;line-height:1.9;}
.period-badge{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:14px 20px;text-align:center;min-width:200px;flex-shrink:0;}
.period-badge .plabel{font-size:.65rem;opacity:.7;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;}
.period-badge .pval{font-weight:700;font-size:.92rem;line-height:1.5;}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;}
.stat{background:#fff;border-radius:12px;padding:20px 24px;box-shadow:0 2px 8px rgba(0,0,0,.07);border-left:4px solid #e2e8f0;}
.stat.s1{border-left-color:#6d28d9;} .stat.s2{border-left-color:#16a34a;} .stat.s3{border-left-color:#2563eb;} .stat.s4{border-left-color:#d97706;}
.stat label{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;display:block;margin-bottom:6px;}
.stat .val{font-size:1.8rem;font-weight:800;}
.stat .sub{font-size:.74rem;color:#94a3b8;margin-top:3px;}
.card{background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.07);margin-bottom:24px;overflow:hidden;}
.card-title{padding:16px 24px;font-weight:700;font-size:.95rem;border-bottom:1px solid #f1f5f9;color:#1e293b;display:flex;align-items:center;gap:8px;}
.ct-badge{background:#f1f5f9;border-radius:6px;padding:2px 10px;font-size:.72rem;color:#64748b;font-weight:600;margin-left:auto;}
table{width:100%;border-collapse:collapse;}
th{background:#f8fafc;padding:10px 16px;text-align:left;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;border-bottom:2px solid #e2e8f0;}
td{padding:12px 16px;font-size:.85rem;border-bottom:1px solid #f8fafc;}
tr:last-child td{border-bottom:none;}
tr:hover td{background:#fafbff;}
.total-bar{background:linear-gradient(135deg,#1e40af,#6d28d9);padding:18px 24px;display:flex;justify-content:space-between;align-items:center;color:#fff;}
.footer{text-align:center;padding:28px;font-size:.73rem;color:#94a3b8;line-height:1.8;}
@media print{body{background:#fff;padding:0;}.page{max-width:100%;}.card{box-shadow:none;page-break-inside:avoid;}.report-header{border-radius:0;}}
</style></head>
<body><div class="page">
<div class="report-header">
<div><h1> AutoGarage — Business Report</h1>
<p>Generated: <strong>${date}</strong><br>Customers: ${customers.length} &nbsp;|&nbsp; Vehicles: ${cars.length}<br>Orders in period: <strong>${orders.length}</strong> of ${allOrders.length} total</p>
</div>
<div class="period-badge"><div class="plabel"> Report Period</div><div class="pval">${periodLabel}</div></div>
</div>
<div class="stats">
<div class="stat s1"><label>Total Revenue</label><div class="val" style="color:#6d28d9;">\\$${totalRevenue.toFixed(2)}</div><div class="sub">${orders.length} orders</div></div>
<div class="stat s2"><label>Completed Jobs</label><div class="val" style="color:#16a34a;">${completed}</div><div class="sub">\\$${completedRev.toFixed(2)} earned</div></div>
<div class="stat s3"><label>In Progress</label><div class="val" style="color:#2563eb;">${painting}</div><div class="sub">Currently painting</div></div>
<div class="stat s4"><label>Pending</label><div class="val" style="color:#d97706;">${pending}</div><div class="sub">Awaiting start</div></div>
</div>
${monthRows ? `<div class="card"><div class="card-title"> Monthly Revenue Breakdown <span class="ct-badge">${Object.keys(byMonth).length} months</span></div>
<table><thead><tr><th>Month / Year</th><th>Orders</th><th style="text-align:right;">Revenue</th></tr></thead><tbody>${monthRows}</tbody></table></div>` : ''}
<div class="card"><div class="card-title"> Paint Orders Detail <span class="ct-badge">${orders.length} orders</span></div>
<table><thead><tr><th>Job</th><th>Customer</th><th>Vehicle</th><th>Date</th><th>Status</th><th style="text-align:right;">Price</th></tr></thead>
<tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:28px;color:#94a3b8;">No orders found for this period</td></tr>'}</tbody></table>
<div class="total-bar"><div><div style="font-size:.78rem;opacity:.7;">Total Revenue — ${periodLabel}</div><div style="font-size:.72rem;opacity:.55;margin-top:2px;">${orders.length} orders included</div></div><span style="font-size:1.6rem;font-weight:800;">\\$${totalRevenue.toFixed(2)}</span></div>
</div>
<div class="footer">AutoGarage Business Report &copy; ${now.getFullYear()} &mdash; Confidential<br>Report covers period: ${periodLabel} &mdash; Generated ${date}</div>
</div></body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AutoGarage_Report_${from ? range.from : 'all'}_to_${to ? range.to : now.toISOString().split('T')[0]}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // --- Color Handlers ---
  handleAddColor(color: PaintColor) {
    this.paintService.createColor(color).subscribe(() => this.fetchData());
  }

  handleEditColor(color: PaintColor) {
    this.paintService.updateColor(color._id!, color).subscribe(() => this.fetchData());
  }

  handleDeleteColor(id: string) {
    this.paintService.deleteColor(id).subscribe(() => this.fetchData());
  }

  // --- Payment Handlers ---
  handleAddPayment(payment: Payment) {
    this.paymentService.createPayment(payment).subscribe(() => this.fetchData());
  }

  handleEditPayment(payment: Payment) {
    this.paymentService.updatePayment(payment._id!, payment).subscribe(() => this.fetchData());
  }

  handleDeletePayment(id: string) {
    this.paymentService.deletePayment(id).subscribe(() => this.fetchData());
  }

  getCustomerName(customerRef: string | Customer | undefined): string {
    if (!customerRef) return 'Unknown';
    if (typeof customerRef === 'object' && 'name' in customerRef) return customerRef.name;
    const found = this.customers().find(c => c._id === customerRef);
    return found ? found.name : 'Unknown';
  }

  getCarDetails(carRef: string | Car | undefined): string {
    if (!carRef) return 'Unknown';
    if (typeof carRef === 'object' && 'brand' in carRef) return `${carRef.brand} ${carRef.model} (${carRef.plateNumber})`;
    const found = this.cars().find(c => c._id === carRef);
    return found ? `${found.brand} ${found.model} (${found.plateNumber})` : 'Unknown';
  }
}
