import { Component, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaintOrder } from '../../models/paint';
import { Customer } from '../../models/customer';
import { Car } from '../../models/car';
import { FilterByStatusPipe } from '../../filterByStatus.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-paint-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterByStatusPipe],
  templateUrl: './paint-orders-page.html',
  styleUrl: './paint-orders-page.css'
})
export class PaintOrdersPage {
  orders = input<PaintOrder[]>([]);
  customers = input<Customer[]>([]);
  cars = input<Car[]>([]);

  addOrder = output<PaintOrder>();
  updateStatus = output<{ order: PaintOrder; status: PaintOrder['status'] }>();
  deleteOrder = output<string>();
  generateInvoice = output<PaintOrder>();
  generateReport = output<{ from: string; to: string }>();

  orderSearch = signal<string>('');
  taskFilter = signal<'All' | 'Pending' | 'Painting' | 'Completed'>('All');
  taskView = signal<'kanban' | 'list' | 'table'>('kanban');
  taskSort = signal<'newest' | 'oldest' | 'priceHigh' | 'priceLow'>('newest');
  taskMinPrice = signal<number | null>(null);
  taskMaxPrice = signal<number | null>(null);
  showTaskFilter = signal<boolean>(false);
  showModal = false;
  showReportModal = false;
  reportDateFrom = '';
  reportDateTo = '';

  newTask: Partial<PaintOrder> = { customerId: null as any, carId: null as any, paintType: '', price: 0, status: 'Pending' };

  filteredOrders = computed(() => {
    let list = [...this.orders()];
    if (this.orderSearch()) {
      const q = this.orderSearch().toLowerCase();
      list = list.filter(o =>
        o.paintType.toLowerCase().includes(q) ||
        this.getCustomerName(o.customerId).toLowerCase().includes(q) ||
        this.getCarDetails(o.carId).toLowerCase().includes(q)
      );
    }

    if (this.showTaskFilter()) {
      if (this.taskMinPrice() !== null && this.taskMinPrice() !== undefined) {
        list = list.filter(o => (o.price || 0) >= this.taskMinPrice()!);
      }
      if (this.taskMaxPrice() !== null && this.taskMaxPrice() !== undefined) {
        list = list.filter(o => (o.price || 0) <= this.taskMaxPrice()!);
      }
    }

    list.sort((a, b) => {
      if (this.taskSort() === 'priceHigh') return (b.price || 0) - (a.price || 0);
      if (this.taskSort() === 'priceLow') return (a.price || 0) - (b.price || 0);
      if (this.taskSort() === 'oldest') {
        const da = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
        const db = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
        return da - db;
      }
      const da = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
      const db = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
      return db - da;
    });

    return list;
  });

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

  openAdd() {
    this.newTask = { customerId: null as any, carId: null as any, paintType: '', price: 0, status: 'Pending' };
    this.showModal = true;
  }

  saveTask() {
    if (!this.newTask.customerId || !this.newTask.carId) return;
    this.addOrder.emit(this.newTask as PaintOrder);
    this.showModal = false;
  }

  onUpdateStatus(order: PaintOrder, status: PaintOrder['status']) {
    if (order.status === status) return;
    this.updateStatus.emit({ order, status });
  }

  onDelete(id: string) {
    Swal.fire({
      title: 'Delete this task?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteOrder.emit(id);
      }
    });
  }

  onGenerateInvoice(order: PaintOrder) {
    this.generateInvoice.emit(order);
  }

  onGenerateReport() {
    this.generateReport.emit({ from: this.reportDateFrom, to: this.reportDateTo });
    this.showReportModal = false;
  }

  exportCSV() {
    const list = this.filteredOrders();
    const headers = 'Task,Customer,Vehicle,Status,Price\n';
    const csv = list.map(o =>
      `${o.paintType},"${this.getCustomerName(o.customerId)}","${this.getCarDetails(o.carId)}",${o.status},${o.price || 0}`
    ).join('\n');
    const blob = new Blob([headers + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
