import { Component, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Payment } from '../../models/payment';
import { PaintOrder } from '../../models/paint';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments-page.html',
  styleUrl: './payments-page.css'
})
export class PaymentsPage {
  payments = input<Payment[]>([]);
  orders = input<PaintOrder[]>([]);
  addPayment = output<Payment>();
  editPayment = output<Payment>();
  deletePayment = output<string>();

  paymentSearch = signal<string>('');
  statusFilter = signal<string>('All');
  showModal = false;
  editing: Payment | null = null;
  form: Partial<Payment> = { orderId: null as any, amount: 0, method: 'Cash', status: 'Pending' };

  filteredPayments = () => {
    let list = this.payments();
    const q = this.paymentSearch().toLowerCase();
    if (q) {
      list = list.filter(p => {
        const order = this.getOrder(p.orderId);
        return order?.paintType.toLowerCase().includes(q);
      });
    }
    if (this.statusFilter() !== 'All') {
      list = list.filter(p => p.status === this.statusFilter());
    }
    return list;
  };

  getOrder(orderRef: string | PaintOrder | undefined): PaintOrder | undefined {
    if (!orderRef) return undefined;
    if (typeof orderRef === 'object') return orderRef;
    return this.orders().find(o => o._id === orderRef);
  }

  getOrderName(orderRef: string | PaintOrder | undefined): string {
    const order = this.getOrder(orderRef);
    return order ? `${order.paintType} Paint Job` : 'Unknown';
  }

  openAdd() {
    this.editing = null;
    this.form = { orderId: null as any, amount: 0, method: 'Cash', status: 'Pending' };
    this.showModal = true;
  }

  openEdit(p: Payment) {
    this.editing = p;
    this.form = { ...p };
    this.showModal = true;
  }

  save() {
    if (!this.form.orderId || !this.form.amount) return;
    if (this.editing) {
      this.editPayment.emit({ ...this.editing, ...this.form } as Payment);
    } else {
      this.addPayment.emit(this.form as Payment);
    }
    this.showModal = false;
  }

  onDelete(id: string) {
    Swal.fire({
      title: 'Delete this payment record?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deletePayment.emit(id);
      }
    });
  }
}
