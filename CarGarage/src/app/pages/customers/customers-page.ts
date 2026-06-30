import { Component, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../models/customer';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers-page.html',
  styleUrl: './customers-page.css'
})
export class CustomersPage {
  customers = input<Customer[]>([]);
  addCustomer = output<Customer>();
  editCustomer = output<Customer>();
  deleteCustomer = output<string>();

  userSearch = signal<string>('');
  userRoleFilter = signal<string>('All');
  userStatusFilter = signal<string>('All');
  rowsPerPage = signal<number>(10);
  showModal = false;
  editing: Customer | null = null;
  form: Partial<Customer> = { name: '', phone: '', address: '', role: 'User', status: 'Active' };

  filteredCustomers = computed(() => {
    let list = this.customers();
    if (this.userSearch()) {
      const q = this.userSearch().toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }
    if (this.userRoleFilter() !== 'All') {
      list = list.filter(c => (c.role || 'User') === this.userRoleFilter());
    }
    if (this.userStatusFilter() !== 'All') {
      list = list.filter(c => (c.status || 'Active') === this.userStatusFilter());
    }
    return list.slice(0, this.rowsPerPage());
  });

  openAdd() {
    this.editing = null;
    this.form = { name: '', phone: '', address: '', role: 'User', status: 'Active' };
    this.showModal = true;
  }

  openEdit(c: Customer) {
    this.editing = c;
    this.form = { ...c };
    this.showModal = true;
  }

  save() {
    if (!this.form.name || !this.form.phone) return;
    if (this.editing) {
      this.editCustomer.emit({ ...this.editing, ...this.form } as Customer);
    } else {
      this.addCustomer.emit(this.form as Customer);
    }
    this.showModal = false;
  }

  onDelete(id: string) {
    Swal.fire({
      title: 'Delete this user?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteCustomer.emit(id);
      }
    });
  }

  exportCSV() {
    const list = this.filteredCustomers();
    const headers = 'Name,Email,Username,Role,Status,Phone\n';
    const csv = list.map((c, i) => `${c.name},${c.name.split(' ')[0].toLowerCase()}@gmail.com,${c.name.split(' ')[0].toLowerCase()}${i * 7},${c.role || 'User'},${c.status || 'Active'},${c.phone}`).join('\n');
    const blob = new Blob([headers + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
