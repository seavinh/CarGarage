import { Component, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Car } from '../../models/car';
import { Customer } from '../../models/customer';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cars-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cars-page.html',
  styleUrl: './cars-page.css'
})
export class CarsPage {
  cars = input<Car[]>([]);
  customers = input<Customer[]>([]);

  addCar = output<Car>();
  editCar = output<Car>();
  deleteCar = output<string>();

  carSearch = signal<string>('');
  carFilter = signal<'all' | 'assigned' | 'unassigned'>('all');
  showCarModal = false;
  editingCar: Car | null = null;
  newCar: Partial<Car> = { brand: '', model: '', year: new Date().getFullYear(), plateNumber: '', color: '#000000', customerId: null as any };

  assignedCarsCount = computed(() => this.cars().filter(c => !!c.customerId).length);
  unassignedCarsCount = computed(() => this.cars().filter(c => !c.customerId).length);

  filteredCars = computed(() => {
    let list = this.cars();
    if (this.carSearch()) {
      const q = this.carSearch().toLowerCase();
      list = list.filter(c => c.brand.toLowerCase().includes(q) || c.plateNumber.toLowerCase().includes(q));
    }
    if (this.carFilter() === 'assigned') list = list.filter(c => !!c.customerId);
    if (this.carFilter() === 'unassigned') list = list.filter(c => !c.customerId);
    return list;
  });

  getCustomerName(customerRef: string | Customer | undefined): string {
    if (!customerRef) return 'Unassigned';
    if (typeof customerRef === 'object' && 'name' in customerRef) {
      return customerRef.name;
    }
    const found = this.customers().find(c => c._id === customerRef);
    return found ? found.name : 'Unknown';
  }

  openAddModal() {
    this.editingCar = null;
    this.newCar = { brand: '', model: '', year: new Date().getFullYear(), plateNumber: '', color: '#000000', customerId: null as any };
    this.showCarModal = true;
  }

  openEditModal(car: Car) {
    this.editingCar = car;
    this.newCar = { ...car };
    this.showCarModal = true;
  }

  saveCar() {
    if (!this.newCar.brand || !this.newCar.plateNumber) return;
    const car = { ...this.newCar } as Car;
    this.addCar.emit(car);
    this.showCarModal = false;
  }

  onDeleteCar(id: string) {
    Swal.fire({
      title: 'Delete this vehicle?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteCar.emit(id);
      }
    });
  }
}
